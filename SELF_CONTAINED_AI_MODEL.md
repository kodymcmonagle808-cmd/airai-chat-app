# Self-Contained AI Model — Text Generation + API Knowledge

A working AI that generates text and pulls live knowledge from free APIs. No pretrained models — the neural network trains from scratch. Uses Wikipedia, DuckDuckGo, Dictionary API, and more for real information.

---

## Architecture Overview

```
User Input
    │
    ▼
┌─────────────────────┐
│  Intent Classifier   │  ← Neural net (trained from scratch)
│  (NeuralNetwork)     │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   API Router         │  ← Routes to the right knowledge source
│                      │
│  ┌─── Wikipedia ───┐ │
│  ┌─── DuckDuckGo ──┐ │
│  ┌─── Dictionary ──┐ │
│  ┌─── Math Engine ─┐ │
│  ┌─── Weather ─────┐ │
│  ┌─── News ────────┐ │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Text Generator      │  ← Markov chain + templates (no pretrained model)
│  (response builder)  │
└─────────────────────┘
          │
          ▼
    Generated Response
```

---

## Part 1: Neural Network (Classification Engine)

Same backprop network from before — classifies user intent to route queries.

```javascript
class NeuralNetwork {
  constructor(layerSizes) {
    this.layers = [];
    this.biases = [];
    this.learningRate = 0.05;

    for (let i = 0; i < layerSizes.length - 1; i++) {
      const rows = layerSizes[i + 1];
      const cols = layerSizes[i];
      const scale = Math.sqrt(2 / (cols + rows));
      this.layers.push(
        Array.from({ length: rows }, () =>
          Array.from({ length: cols }, () => (Math.random() * 2 - 1) * scale)
        )
      );
      this.biases.push(Array.from({ length: rows }, () => 0));
    }
  }

  relu(x) { return Math.max(0, x); }
  reluDeriv(x) { return x > 0 ? 1 : 0; }

  softmax(arr) {
    const max = Math.max(...arr);
    const exps = arr.map(x => Math.exp(x - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(x => x / sum);
  }

  forward(input) {
    let activations = [input];
    let preActs = [];
    let current = input;

    for (let l = 0; l < this.layers.length; l++) {
      const w = this.layers[l], b = this.biases[l], raw = [];
      for (let j = 0; j < w.length; j++) {
        let sum = b[j];
        for (let k = 0; k < current.length; k++) sum += w[j][k] * current[k];
        raw.push(sum);
      }
      preActs.push(raw);
      current = l === this.layers.length - 1 ? this.softmax(raw) : raw.map(x => this.relu(x));
      activations.push(current);
    }
    return { activations, preActs };
  }

  trainStep(input, target) {
    const { activations, preActs } = this.forward(input);
    const output = activations[activations.length - 1];
    let deltas = output.map((o, i) => o - target[i]);

    for (let l = this.layers.length - 1; l >= 0; l--) {
      const prev = activations[l];
      const newDeltas = new Array(prev.length).fill(0);
      for (let j = 0; j < this.layers[l].length; j++) {
        this.biases[l][j] -= this.learningRate * deltas[j];
        for (let k = 0; k < this.layers[l][j].length; k++) {
          newDeltas[k] += this.layers[l][j][k] * deltas[j];
          this.layers[l][j][k] -= this.learningRate * deltas[j] * prev[k];
        }
      }
      if (l > 0) deltas = newDeltas.map((d, i) => d * this.reluDeriv(preActs[l - 1][i]));
    }

    let loss = 0;
    for (let i = 0; i < target.length; i++) if (target[i] === 1) loss -= Math.log(output[i] + 1e-10);
    return loss;
  }

  train(data, epochs = 500) {
    for (let e = 0; e < epochs; e++) {
      let totalLoss = 0;
      const shuffled = [...data].sort(() => Math.random() - 0.5);
      for (const { input, target } of shuffled) totalLoss += this.trainStep(input, target);
      if (e % 100 === 0) console.log(`Epoch ${e} | Loss: ${(totalLoss / data.length).toFixed(4)}`);
    }
  }

  predict(input) { return this.forward(input).activations.pop(); }
  classify(input) { const o = this.predict(input); return o.indexOf(Math.max(...o)); }
  export() { return JSON.stringify({ layers: this.layers, biases: this.biases }); }
  import(json) { const d = JSON.parse(json); this.layers = d.layers; this.biases = d.biases; }
}
```

---

## Part 2: Text Generator (Markov Chain — No Pretrained Model)

Learns word patterns from text you feed it. Generates new text by following learned probabilities.

```javascript
class TextGenerator {
  constructor(order = 2) {
    this.order = order;       // How many words of context to use
    this.chain = {};          // { "word1 word2": { "word3": 5, "word4": 2 } }
    this.starters = [];       // Sentence starters
  }

  // Feed it text to learn from
  learn(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());

    for (const sentence of sentences) {
      const words = sentence.trim().split(/\s+/).filter(w => w);
      if (words.length < this.order + 1) continue;

      this.starters.push(words.slice(0, this.order).join(' '));

      for (let i = 0; i <= words.length - this.order - 1; i++) {
        const key = words.slice(i, i + this.order).join(' ');
        const next = words[i + this.order];

        if (!this.chain[key]) this.chain[key] = {};
        this.chain[key][next] = (this.chain[key][next] || 0) + 1;
      }
    }
  }

  // Pick a random word based on weighted probabilities
  _weightedPick(options) {
    const entries = Object.entries(options);
    const total = entries.reduce((sum, [, count]) => sum + count, 0);
    let rand = Math.random() * total;

    for (const [word, count] of entries) {
      rand -= count;
      if (rand <= 0) return word;
    }
    return entries[entries.length - 1][0];
  }

  // Generate text of a given length
  generate(maxWords = 30) {
    if (this.starters.length === 0) return 'No training data loaded yet.';

    const starter = this.starters[Math.floor(Math.random() * this.starters.length)];
    const words = starter.split(' ');

    for (let i = 0; i < maxWords - this.order; i++) {
      const key = words.slice(-this.order).join(' ');
      const options = this.chain[key];
      if (!options) break;
      words.push(this._weightedPick(options));
    }

    let result = words.join(' ');
    // Capitalize first letter and add period
    result = result.charAt(0).toUpperCase() + result.slice(1);
    if (!/[.!?]$/.test(result)) result += '.';
    return result;
  }

  // Generate text that's relevant to a topic (filters starters)
  generateAbout(topic, maxWords = 30) {
    const topicWords = topic.toLowerCase().split(/\s+/);
    const relevant = this.starters.filter(s =>
      topicWords.some(tw => s.toLowerCase().includes(tw))
    );

    if (relevant.length === 0) return this.generate(maxWords);

    const starter = relevant[Math.floor(Math.random() * relevant.length)];
    const words = starter.split(' ');

    for (let i = 0; i < maxWords - this.order; i++) {
      const key = words.slice(-this.order).join(' ');
      const options = this.chain[key];
      if (!options) break;
      words.push(this._weightedPick(options));
    }

    let result = words.join(' ');
    result = result.charAt(0).toUpperCase() + result.slice(1);
    if (!/[.!?]$/.test(result)) result += '.';
    return result;
  }

  export() { return JSON.stringify({ order: this.order, chain: this.chain, starters: this.starters }); }
  import(json) { const d = JSON.parse(json); this.order = d.order; this.chain = d.chain; this.starters = d.starters; }
}
```

---

## Part 3: Free API Integrations (No API Keys Required)

All of these are free, public APIs — no sign-up, no keys, no cost.

```javascript
class KnowledgeAPIs {

  // ─── Wikipedia ───────────────────────────────────────────
  // Search and get article summaries
  static async wikipedia(query) {
    try {
      const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
      const res = await fetch(searchUrl);
      if (!res.ok) {
        // Try search instead of direct lookup
        const searchRes = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`
        );
        const searchData = await searchRes.json();
        if (searchData.query?.search?.length > 0) {
          const title = searchData.query.search[0].title;
          const summaryRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
          const summaryData = await summaryRes.json();
          return {
            title: summaryData.title,
            summary: summaryData.extract,
            url: summaryData.content_urls?.desktop?.page || '',
            source: 'Wikipedia'
          };
        }
        return { title: query, summary: 'No Wikipedia article found.', url: '', source: 'Wikipedia' };
      }
      const data = await res.json();
      return {
        title: data.title,
        summary: data.extract,
        url: data.content_urls?.desktop?.page || '',
        source: 'Wikipedia'
      };
    } catch (e) {
      return { title: query, summary: `Wikipedia error: ${e.message}`, url: '', source: 'Wikipedia' };
    }
  }

  // ─── DuckDuckGo Instant Answer ───────────────────────────
  // Quick factual answers
  static async duckduckgo(query) {
    try {
      const res = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
      );
      const data = await res.json();
      return {
        answer: data.AbstractText || data.Answer || 'No instant answer available.',
        source: data.AbstractSource || 'DuckDuckGo',
        url: data.AbstractURL || '',
        related: (data.RelatedTopics || []).slice(0, 5).map(t => t.Text).filter(Boolean)
      };
    } catch (e) {
      return { answer: `DuckDuckGo error: ${e.message}`, source: 'DuckDuckGo', url: '', related: [] };
    }
  }

  // ─── Free Dictionary API ─────────────────────────────────
  // Word definitions, pronunciation, examples
  static async dictionary(word) {
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      if (!res.ok) return { word, definitions: [], found: false };
      const data = await res.json();
      const entry = data[0];
      return {
        word: entry.word,
        phonetic: entry.phonetic || '',
        audio: entry.phonetics?.find(p => p.audio)?.audio || '',
        definitions: entry.meanings.map(m => ({
          partOfSpeech: m.partOfSpeech,
          definition: m.definitions[0]?.definition || '',
          example: m.definitions[0]?.example || ''
        })),
        found: true
      };
    } catch (e) {
      return { word, definitions: [], found: false };
    }
  }

  // ─── Math.js API ─────────────────────────────────────────
  // Evaluate math expressions
  static async math(expression) {
    try {
      const res = await fetch(
        `https://api.mathjs.org/v4/?expr=${encodeURIComponent(expression)}`
      );
      const result = await res.text();
      return { expression, result, source: 'mathjs' };
    } catch (e) {
      return { expression, result: `Math error: ${e.message}`, source: 'mathjs' };
    }
  }

  // ─── Open Trivia DB ──────────────────────────────────────
  // Random trivia/fun facts
  static async trivia(amount = 1, category = null) {
    try {
      let url = `https://opentdb.com/api.php?amount=${amount}&type=multiple`;
      if (category) url += `&category=${category}`;
      const res = await fetch(url);
      const data = await res.json();
      return data.results.map(q => ({
        question: q.question.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&'),
        correct: q.correct_answer,
        answers: [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5),
        category: q.category,
        difficulty: q.difficulty
      }));
    } catch (e) {
      return [{ question: `Trivia error: ${e.message}`, correct: '', answers: [], category: '', difficulty: '' }];
    }
  }

  // ─── Numbers API ─────────────────────────────────────────
  // Fun facts about numbers and dates
  static async numberFact(number) {
    try {
      const res = await fetch(`http://numbersapi.com/${number}?json`);
      const data = await res.json();
      return { number, fact: data.text, found: data.found };
    } catch (e) {
      return { number, fact: `Numbers error: ${e.message}`, found: false };
    }
  }

  // ─── JokeAPI ─────────────────────────────────────────────
  // Random jokes
  static async joke(category = 'Any') {
    try {
      const res = await fetch(
        `https://v2.jokeapi.dev/joke/${category}?blacklistFlags=nsfw,racist,sexist&type=twopart`
      );
      const data = await res.json();
      if (data.type === 'twopart') return { setup: data.setup, punchline: data.delivery };
      return { setup: data.joke, punchline: '' };
    } catch (e) {
      return { setup: `Joke error: ${e.message}`, punchline: '' };
    }
  }

  // ─── IP Geolocation (free) ───────────────────────────────
  // Get location from IP
  static async geolocate() {
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      return {
        ip: data.ip,
        city: data.city,
        region: data.region,
        country: data.country_name,
        timezone: data.timezone,
        org: data.org
      };
    } catch (e) {
      return { error: e.message };
    }
  }

  // ─── Public Holiday API ──────────────────────────────────
  static async holidays(countryCode = 'US', year = new Date().getFullYear()) {
    try {
      const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
      const data = await res.json();
      return data.map(h => ({ date: h.date, name: h.localName }));
    } catch (e) {
      return [{ date: '', name: `Holiday error: ${e.message}` }];
    }
  }
}
```

---

## Part 4: Putting It All Together — The AI Assistant

This ties the neural net intent classifier, text generator, and APIs into one chatbot.

```javascript
class AIAssistant {
  // ── API Key ──
  static API_KEY = 'AI-kakakakka';

  constructor(apiKey) {
    // Validate API key before initializing
    if (apiKey !== AIAssistant.API_KEY) {
      throw new Error('Invalid API key. Access denied.');
    }
    this.authenticated = true;

    // ── Intent definitions ──
    this.intents = [
      { label: 0, name: 'greeting',    patterns: ['hello', 'hi', 'hey', 'sup', 'yo', 'good morning', 'good evening', 'whats up'] },
      { label: 1, name: 'goodbye',     patterns: ['bye', 'goodbye', 'see ya', 'later', 'peace', 'im leaving', 'gotta go'] },
      { label: 2, name: 'thanks',      patterns: ['thanks', 'thank you', 'appreciate', 'thx', 'ty'] },
      { label: 3, name: 'wiki',        patterns: ['what is', 'who is', 'tell me about', 'explain', 'define', 'what are', 'who was', 'history of'] },
      { label: 4, name: 'search',      patterns: ['search', 'look up', 'find', 'google', 'search for'] },
      { label: 5, name: 'dictionary',  patterns: ['meaning of', 'define word', 'what does mean', 'definition', 'synonym'] },
      { label: 6, name: 'math',        patterns: ['calculate', 'math', 'solve', 'compute', 'what is the sum', 'multiply', 'divide', 'plus', 'minus', 'equation'] },
      { label: 7, name: 'joke',        patterns: ['joke', 'funny', 'make me laugh', 'humor', 'tell me a joke'] },
      { label: 8, name: 'trivia',      patterns: ['trivia', 'quiz', 'fun fact', 'did you know', 'random fact'] },
      { label: 9, name: 'generate',    patterns: ['write', 'generate', 'create text', 'write me', 'compose', 'make up a story', 'write about'] },
      { label: 10, name: 'help',       patterns: ['help', 'what can you do', 'commands', 'abilities', 'features'] },
      { label: 11, name: 'weather',    patterns: ['weather', 'temperature', 'forecast', 'rain', 'sunny'] },
      { label: 12, name: 'time',       patterns: ['time', 'date', 'what day', 'what time', 'today'] },
      { label: 13, name: 'number',     patterns: ['number fact', 'fact about number', 'tell me about the number'] },
    ];

    // ── Build vocabulary ──
    this.vocab = [...new Set(this.intents.flatMap(i => i.patterns.flatMap(p => p.toLowerCase().split(/\s+/))))];

    // ── Build and train intent classifier ──
    this.classifier = new NeuralNetwork([this.vocab.length, 32, 16, this.intents.length]);
    this.classifier.learningRate = 0.1;
    this._trainClassifier();

    // ── Text generator ──
    this.textGen = new TextGenerator(2);
    // Seed with some base text — will improve as it learns from API responses
    this.textGen.learn(`
      The world is a fascinating place full of wonders and discoveries.
      Science helps us understand the universe around us.
      Technology continues to advance at a rapid pace.
      People have always been curious about the world.
      Knowledge is power and learning never stops.
      The internet connects billions of people across the globe.
      History teaches us valuable lessons about humanity.
      Mathematics is the language of the universe.
      Art and creativity make life more beautiful.
      Nature provides everything we need to survive.
    `);

    // ── Response templates for each intent ──
    this.templates = {
      greeting: ['Hey there! How can I help you?', 'Hello! What would you like to know?', 'Hi! Ask me anything — I can search Wikipedia, solve math, define words, and more.'],
      goodbye: ['See you later!', 'Goodbye! Come back anytime.', 'Peace out!'],
      thanks: ["You're welcome!", 'Happy to help!', 'Anytime!'],
      help: [`Here's what I can do:
• **Search Wikipedia** — "what is quantum physics"
• **DuckDuckGo search** — "search for black holes"
• **Define words** — "define serendipity"
• **Solve math** — "calculate 5 * (3 + 2)"
• **Tell jokes** — "tell me a joke"
• **Trivia quiz** — "give me trivia"
• **Number facts** — "fact about number 42"
• **Generate text** — "write about space"
• **Time/date** — "what time is it"`],
      weather: ['I don\'t have a free weather API without a key, but try searching: "weather [your city]" on DuckDuckGo!'],
      time: [],  // handled dynamically
      number: [] // handled dynamically
    };
  }

  // ── Encode text for the neural net ──
  _encode(text) {
    const words = text.toLowerCase().split(/\s+/);
    return this.vocab.map(v => words.includes(v) ? 1 : 0);
  }

  _oneHot(label) {
    const arr = new Array(this.intents.length).fill(0);
    arr[label] = 1;
    return arr;
  }

  // ── Train the intent classifier ──
  _trainClassifier() {
    const data = this.intents.flatMap(intent =>
      intent.patterns.map(pattern => ({
        input: this._encode(pattern),
        target: this._oneHot(intent.label)
      }))
    );
    this.classifier.train(data, 800);
    console.log('Intent classifier trained.');
  }

  // ── Extract the subject from a query ──
  _extractSubject(text) {
    const removeWords = ['what', 'is', 'who', 'was', 'are', 'tell', 'me', 'about', 'the',
      'search', 'for', 'look', 'up', 'find', 'define', 'meaning', 'of', 'word',
      'explain', 'calculate', 'solve', 'compute', 'write', 'generate', 'create',
      'fact', 'number', 'a', 'an', 'please', 'can', 'you', 'do'];
    const words = text.toLowerCase().split(/\s+/).filter(w => !removeWords.includes(w));
    return words.join(' ').trim() || text;
  }

  // ── Main chat function ──
  async chat(userMessage) {
    if (!this.authenticated) return 'Error: Not authenticated. Provide a valid API key.';
    const intentIdx = this.classifier.classify(this._encode(userMessage));
    const intentName = this.intents[intentIdx].name;
    const subject = this._extractSubject(userMessage);

    console.log(`[Intent: ${intentName}] [Subject: "${subject}"]`);

    switch (intentName) {
      case 'greeting':
      case 'goodbye':
      case 'thanks':
      case 'help':
      case 'weather': {
        const options = this.templates[intentName];
        return options[Math.floor(Math.random() * options.length)];
      }

      case 'wiki': {
        const result = await KnowledgeAPIs.wikipedia(subject);
        // Learn from the Wikipedia text to improve future generation
        if (result.summary && result.summary !== 'No Wikipedia article found.') {
          this.textGen.learn(result.summary);
        }
        return `**${result.title}** (Wikipedia)\n\n${result.summary}\n\n${result.url ? `[Read more](${result.url})` : ''}`;
      }

      case 'search': {
        const result = await KnowledgeAPIs.duckduckgo(subject);
        if (result.answer && result.answer !== 'No instant answer available.') {
          this.textGen.learn(result.answer);
        }
        let response = `**${result.source}**\n\n${result.answer}`;
        if (result.related.length > 0) {
          response += '\n\n**Related:**\n' + result.related.map(r => `• ${r}`).join('\n');
        }
        if (result.url) response += `\n\n[Source](${result.url})`;
        return response;
      }

      case 'dictionary': {
        const word = subject.split(/\s+/).pop(); // Get last word as the target
        const result = await KnowledgeAPIs.dictionary(word);
        if (!result.found) return `Could not find a definition for "${word}".`;
        let response = `**${result.word}** ${result.phonetic}\n\n`;
        for (const def of result.definitions) {
          response += `*${def.partOfSpeech}*: ${def.definition}\n`;
          if (def.example) response += `  Example: "${def.example}"\n`;
        }
        return response;
      }

      case 'math': {
        // Extract math expression
        const expr = userMessage.replace(/^(calculate|solve|compute|math|what is)\s*/i, '').trim();
        const result = await KnowledgeAPIs.math(expr);
        return `**${result.expression}** = **${result.result}**`;
      }

      case 'joke': {
        const joke = await KnowledgeAPIs.joke();
        return joke.punchline ? `${joke.setup}\n\n*${joke.punchline}*` : joke.setup;
      }

      case 'trivia': {
        const questions = await KnowledgeAPIs.trivia(1);
        const q = questions[0];
        return `**${q.category}** (${q.difficulty})\n\n${q.question}\n\n` +
          q.answers.map((a, i) => `${i + 1}. ${a}`).join('\n') +
          `\n\n||Answer: ${q.correct}||`;
      }

      case 'generate': {
        // Generate text about the subject using the Markov chain
        // First try to get some Wikipedia knowledge to enrich generation
        const wikiData = await KnowledgeAPIs.wikipedia(subject);
        if (wikiData.summary && wikiData.summary !== 'No Wikipedia article found.') {
          this.textGen.learn(wikiData.summary);
        }
        const generated = this.textGen.generateAbout(subject, 50);
        return `**Generated text about "${subject}":**\n\n${generated}`;
      }

      case 'time': {
        const now = new Date();
        return `It's **${now.toLocaleTimeString()}** on **${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}**`;
      }

      case 'number': {
        const num = parseInt(subject.match(/\d+/)?.[0]) || Math.floor(Math.random() * 100);
        const result = await KnowledgeAPIs.numberFact(num);
        return `**${result.number}**: ${result.fact}`;
      }

      default:
        return 'I\'m not sure how to help with that. Type "help" to see what I can do!';
    }
  }
}
```

---

## Usage

```javascript
// Must pass the API key to create an instance
const ai = new AIAssistant('AI-kakakakka');  // Valid key — works
const bad = new AIAssistant('wrong-key');     // Throws: "Invalid API key. Access denied."

// Then use it
const response = await ai.chat('what is quantum physics');
console.log(response);
```

---

## Usage — Drop-In HTML Chat UI

Copy this into an HTML file and open it. Requires the API key `AI-kakakakka` to unlock.

```html
<!DOCTYPE html>
<html>
<head>
  <title>AI Assistant</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, sans-serif; background: #1a1a2e; color: #e0e0e0; height: 100vh; display: flex; flex-direction: column; }
    #auth-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; gap: 16px; }
    #auth-screen h1 { font-size: 24px; color: #82b1ff; }
    #auth-screen p { color: #888; font-size: 14px; }
    #key-input { padding: 12px 20px; border: 1px solid #333; border-radius: 12px; background: #2a2a4a; color: #e0e0e0; font-size: 16px; width: 300px; text-align: center; outline: none; }
    #key-input:focus { border-color: #3a86ff; }
    #key-submit { padding: 12px 32px; background: #3a86ff; color: #fff; border: none; border-radius: 12px; font-weight: 600; font-size: 15px; cursor: pointer; }
    #key-submit:hover { background: #2a76ef; }
    #key-error { color: #ff5252; font-size: 13px; display: none; }
    #chat-app { display: none; flex-direction: column; height: 100vh; }
    #chat { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
    .msg { max-width: 75%; padding: 12px 16px; border-radius: 16px; line-height: 1.5; font-size: 14px; white-space: pre-wrap; }
    .msg.user { align-self: flex-end; background: #3a86ff; color: #fff; border-bottom-right-radius: 4px; }
    .msg.bot { align-self: flex-start; background: #2a2a4a; border-bottom-left-radius: 4px; }
    .msg.bot strong { color: #82b1ff; }
    .msg.bot em { color: #b0bec5; }
    #input-row { display: flex; padding: 16px; background: #16213e; gap: 10px; }
    #input { flex: 1; padding: 12px 16px; border: 1px solid #333; border-radius: 24px; background: #1a1a2e; color: #e0e0e0; font-size: 15px; outline: none; }
    #input:focus { border-color: #3a86ff; }
    #send { padding: 12px 24px; background: #3a86ff; color: #fff; border: none; border-radius: 24px; font-weight: 600; cursor: pointer; }
    #send:hover { background: #2a76ef; }
    .loading { align-self: flex-start; color: #888; font-style: italic; padding: 8px 16px; }
  </style>
</head>
<body>

<!-- API Key Auth Screen -->
<div id="auth-screen">
  <h1>AI Assistant</h1>
  <p>Enter your API key to continue</p>
  <input id="key-input" type="password" placeholder="API Key" autocomplete="off" />
  <button id="key-submit">Unlock</button>
  <div id="key-error">Invalid API key. Access denied.</div>
</div>

<!-- Chat App (hidden until authenticated) -->
<div id="chat-app">
  <div id="chat">
    <div class="msg bot">Hi! I'm an AI assistant. I can search <strong>Wikipedia</strong>, <strong>DuckDuckGo</strong>, solve <strong>math</strong>, <strong>define words</strong>, tell <strong>jokes</strong>, give <strong>trivia</strong>, <strong>generate text</strong>, and more. Type <strong>help</strong> to see everything I can do!</div>
  </div>
  <div id="input-row">
    <input id="input" placeholder="Ask me anything..." autocomplete="off" />
    <button id="send">Send</button>
  </div>
</div>

<!-- Paste NeuralNetwork, TextGenerator, KnowledgeAPIs, and AIAssistant classes here -->
<script>
  // ... (paste all 4 classes from above) ...

  let ai = null;
  const chatEl = document.getElementById('chat');
  const inputEl = document.getElementById('input');

  // ── API Key Authentication ──
  document.getElementById('key-submit').addEventListener('click', authenticate);
  document.getElementById('key-input').addEventListener('keydown', e => { if (e.key === 'Enter') authenticate(); });

  function authenticate() {
    const key = document.getElementById('key-input').value.trim();
    try {
      ai = new AIAssistant(key);
      document.getElementById('auth-screen').style.display = 'none';
      document.getElementById('chat-app').style.display = 'flex';
      inputEl.focus();
    } catch (e) {
      const err = document.getElementById('key-error');
      err.style.display = 'block';
      document.getElementById('key-input').value = '';
      setTimeout(() => err.style.display = 'none', 3000);
    }
  }

  function addMsg(text, sender) {
    const div = document.createElement('div');
    div.className = `msg ${sender}`;
    div.innerHTML = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\|\|(.*?)\|\|/g, '<span style="background:#444;color:#444;cursor:pointer" onclick="this.style.color=\'#e0e0e0\'">$1</span>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color:#82b1ff">$1</a>')
      .replace(/\n/g, '<br>');
    chatEl.appendChild(div);
    chatEl.scrollTop = chatEl.scrollHeight;
  }

  async function send() {
    const text = inputEl.value.trim();
    if (!text || !ai) return;
    inputEl.value = '';
    addMsg(text, 'user');

    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.textContent = 'Thinking...';
    chatEl.appendChild(loading);
    chatEl.scrollTop = chatEl.scrollHeight;

    const response = await ai.chat(text);
    loading.remove();
    addMsg(response, 'bot');
  }

  document.getElementById('send').addEventListener('click', send);
  inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
</script>

</body>
</html>
```

---

## Summary

| Component | What It Does | Pretrained? |
|---|---|---|
| **NeuralNetwork** | Classifies user intent (greeting, wiki, math, etc.) | No — trains from scratch on boot |
| **TextGenerator** | Generates text via Markov chains, learns from API data | No — builds word chains at runtime |
| **KnowledgeAPIs** | Pulls live data from 8+ free APIs | N/A — just HTTP calls |
| **AIAssistant** | Orchestrates everything into a chatbot | No |

### APIs Used (All Free, No Keys)

| API | Purpose | URL |
|---|---|---|
| Wikipedia REST | Article summaries | `en.wikipedia.org/api/rest_v1/` |
| DuckDuckGo Instant | Quick answers & search | `api.duckduckgo.com` |
| Free Dictionary | Word definitions | `dictionaryapi.dev` |
| Math.js | Math evaluation | `api.mathjs.org` |
| Open Trivia DB | Quiz questions | `opentdb.com/api.php` |
| Numbers API | Number facts | `numbersapi.com` |
| JokeAPI | Jokes | `v2.jokeapi.dev` |
| IP API | Geolocation | `ipapi.co` |
| Nager.Date | Public holidays | `date.nager.at` |

### What This Can't Do (Honestly)
- Won't match ChatGPT/Claude quality — those use billions of parameters trained on massive datasets
- Text generation is basic Markov chains, not coherent long-form writing
- Intent classification works well for defined patterns but can misclassify novel phrasing
- No memory between sessions (unless you save/load the TextGenerator state)
- CORS may block some APIs if run from `file://` — use a local server (`npx serve` or `python -m http.server`)
