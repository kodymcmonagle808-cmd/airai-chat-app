// ============================================================
// AIrai Local AI Engine
// No pretrained models — trains from scratch at runtime.
// Uses free public APIs for knowledge retrieval.
// API Key required: AI-kakakakka
// ============================================================

// ── Part 1: Neural Network ──────────────────────────────────
class NeuralNetwork {
  constructor(layerSizes) {
    this.layers = [];
    this.biases = [];
    this.learningRate = 0.05;
    for (let i = 0; i < layerSizes.length - 1; i++) {
      const rows = layerSizes[i + 1], cols = layerSizes[i];
      const scale = Math.sqrt(2 / (cols + rows));
      this.layers.push(Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => (Math.random() * 2 - 1) * scale)));
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
    let activations = [input], preActs = [], current = input;
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
      const shuffled = [...data].sort(() => Math.random() - 0.5);
      for (const { input, target } of shuffled) this.trainStep(input, target);
    }
  }
  predict(input) { return this.forward(input).activations.pop(); }
  classify(input) { const o = this.predict(input); return o.indexOf(Math.max(...o)); }
}

// ── Part 2: Markov Chain Text Generator ─────────────────────
class TextGenerator {
  constructor(order = 2) {
    this.order = order;
    this.chain = {};
    this.starters = [];
  }
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
  _weightedPick(options) {
    const entries = Object.entries(options);
    const total = entries.reduce((s, [, c]) => s + c, 0);
    let rand = Math.random() * total;
    for (const [word, count] of entries) { rand -= count; if (rand <= 0) return word; }
    return entries[entries.length - 1][0];
  }
  generate(maxWords = 40) {
    if (this.starters.length === 0) return 'I don\'t have enough information about that yet.';
    const starter = this.starters[Math.floor(Math.random() * this.starters.length)];
    const words = starter.split(' ');
    for (let i = 0; i < maxWords - this.order; i++) {
      const key = words.slice(-this.order).join(' ');
      const options = this.chain[key];
      if (!options) break;
      words.push(this._weightedPick(options));
    }
    let r = words.join(' ');
    r = r.charAt(0).toUpperCase() + r.slice(1);
    if (!/[.!?]$/.test(r)) r += '.';
    return r;
  }
  generateAbout(topic, maxWords = 40) {
    const topicWords = topic.toLowerCase().split(/\s+/);
    const relevant = this.starters.filter(s => topicWords.some(tw => s.toLowerCase().includes(tw)));
    if (relevant.length === 0) return this.generate(maxWords);
    const starter = relevant[Math.floor(Math.random() * relevant.length)];
    const words = starter.split(' ');
    for (let i = 0; i < maxWords - this.order; i++) {
      const key = words.slice(-this.order).join(' ');
      const options = this.chain[key];
      if (!options) break;
      words.push(this._weightedPick(options));
    }
    let r = words.join(' ');
    r = r.charAt(0).toUpperCase() + r.slice(1);
    if (!/[.!?]$/.test(r)) r += '.';
    return r;
  }
}

// ── Part 3: Free Knowledge APIs ─────────────────────────────
class KnowledgeAPIs {
  static async wikipedia(query) {
    try {
      const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
      if (!res.ok) {
        const sr = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`);
        const sd = await sr.json();
        if (sd.query?.search?.length > 0) {
          const title = sd.query.search[0].title;
          const sumRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
          const sumData = await sumRes.json();
          return { title: sumData.title, summary: sumData.extract, url: sumData.content_urls?.desktop?.page || '' };
        }
        return { title: query, summary: null, url: '' };
      }
      const data = await res.json();
      return { title: data.title, summary: data.extract, url: data.content_urls?.desktop?.page || '' };
    } catch { return { title: query, summary: null, url: '' }; }
  }

  static async duckduckgo(query) {
    try {
      const res = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`);
      const data = await res.json();
      return {
        answer: data.AbstractText || data.Answer || null,
        source: data.AbstractSource || 'DuckDuckGo',
        url: data.AbstractURL || '',
        related: (data.RelatedTopics || []).slice(0, 4).map(t => t.Text).filter(Boolean)
      };
    } catch { return { answer: null, source: 'DuckDuckGo', url: '', related: [] }; }
  }

  static async dictionary(word) {
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      if (!res.ok) return null;
      const data = await res.json();
      const entry = data[0];
      return {
        word: entry.word,
        phonetic: entry.phonetic || '',
        definitions: entry.meanings.map(m => ({
          pos: m.partOfSpeech,
          def: m.definitions[0]?.definition || '',
          example: m.definitions[0]?.example || ''
        }))
      };
    } catch { return null; }
  }

  static async math(expression) {
    try {
      const res = await fetch(`https://api.mathjs.org/v4/?expr=${encodeURIComponent(expression)}`);
      return await res.text();
    } catch { return null; }
  }

  static async joke() {
    try {
      const res = await fetch('https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,racist,sexist&type=twopart');
      const data = await res.json();
      return data.type === 'twopart' ? `${data.setup}\n\n*${data.delivery}*` : data.joke;
    } catch { return null; }
  }

  static async trivia() {
    try {
      const res = await fetch('https://opentdb.com/api.php?amount=1&type=multiple');
      const data = await res.json();
      const q = data.results[0];
      const answers = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5);
      const clean = s => s.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&');
      return `**${clean(q.category)}** *(${q.difficulty})*\n\n${clean(q.question)}\n\n${answers.map((a, i) => `${i+1}. ${clean(a)}`).join('\n')}\n\n||Answer: ${clean(q.correct_answer)}||`;
    } catch { return null; }
  }

  static async numberFact(num) {
    try {
      const res = await fetch(`http://numbersapi.com/${num}?json`);
      const data = await res.json();
      return data.text;
    } catch { return null; }
  }
}

// ── Part 4: AIAssistant Orchestrator ────────────────────────
class AIAssistant {
  static API_KEY = 'AI-kakakakka';

  constructor(apiKey) {
    if (apiKey !== AIAssistant.API_KEY) throw new Error('Invalid API key.');
    this.authenticated = true;

    this.intents = [
      { label: 0,  name: 'greeting',   patterns: ['hello','hi','hey','sup','yo','good morning','good evening','whats up','howdy'] },
      { label: 1,  name: 'goodbye',    patterns: ['bye','goodbye','see ya','later','peace','gotta go','farewell'] },
      { label: 2,  name: 'thanks',     patterns: ['thanks','thank you','appreciate','thx','ty','cheers'] },
      { label: 3,  name: 'wiki',       patterns: ['what is','who is','tell me about','explain','what are','who was','history of','describe'] },
      { label: 4,  name: 'search',     patterns: ['search','look up','find','google','search for','look for'] },
      { label: 5,  name: 'dictionary', patterns: ['meaning of','define','what does mean','definition','synonym','antonym'] },
      { label: 6,  name: 'math',       patterns: ['calculate','math','solve','compute','equals','plus','minus','multiply','divide','equation','square root'] },
      { label: 7,  name: 'joke',       patterns: ['joke','funny','make me laugh','humor','tell me a joke','something funny'] },
      { label: 8,  name: 'trivia',     patterns: ['trivia','quiz','fun fact','did you know','random fact','test me'] },
      { label: 9,  name: 'generate',   patterns: ['write','generate','create','compose','make up','write about','write me','write a'] },
      { label: 10, name: 'help',       patterns: ['help','what can you do','commands','abilities','features','how do you work'] },
      { label: 11, name: 'time',       patterns: ['time','date','what day','what time','today','current date'] },
      { label: 12, name: 'number',     patterns: ['number fact','fact about number','tell me about the number','interesting number'] },
      { label: 13, name: 'fallback',   patterns: ['not sure','idk','random','whatever','anything','surprise me'] },
    ];

    this.vocab = [...new Set(this.intents.flatMap(i => i.patterns.flatMap(p => p.toLowerCase().split(/\s+/))))];
    this.classifier = new NeuralNetwork([this.vocab.length, 32, 16, this.intents.length]);
    this.classifier.learningRate = 0.1;

    const data = this.intents.flatMap(intent =>
      intent.patterns.map(pattern => ({
        input: this._encode(pattern),
        target: (() => { const a = new Array(this.intents.length).fill(0); a[intent.label] = 1; return a; })()
      }))
    );
    this.classifier.train(data, 600);

    this.textGen = new TextGenerator(2);
    this.textGen.learn('The world is fascinating and full of wonders. Science explains many mysteries of the universe. Technology advances rapidly every year. People are curious about everything around them. Knowledge grows when we ask questions and seek answers. Learning never stops and every day brings new discoveries. The internet connects billions of people worldwide. Mathematics describes patterns found everywhere in nature. History teaches lessons that shape our future. Art and creativity enrich human experience.');

    this.memory = [];
  }

  _encode(text) {
    const words = text.toLowerCase().split(/\s+/);
    return this.vocab.map(v => words.includes(v) ? 1 : 0);
  }

  _subject(text) {
    const stop = new Set(['what','is','who','was','are','tell','me','about','the','a','an','search','for','look','up','find','define','meaning','of','explain','calculate','solve','compute','write','generate','create','fact','number','please','can','you','do','some','give','show','make']);
    return text.toLowerCase().split(/\s+/).filter(w => !stop.has(w)).join(' ').trim() || text;
  }

  async chat(userMessage) {
    if (!this.authenticated) return 'Error: Not authenticated.';

    // Remember last 6 exchanges for follow-up context
    this.memory.push({ role: 'user', content: userMessage });
    if (this.memory.length > 12) this.memory.shift();

    const intentIdx = this.classifier.classify(this._encode(userMessage));
    const intentName = this.intents[intentIdx].name;
    const subject = this._subject(userMessage);

    let response = '';

    switch (intentName) {
      case 'greeting':
        response = ['Hey! How can I help you today?', 'Hello! Ask me anything.', 'Hi there! What\'s on your mind?'][Math.floor(Math.random() * 3)];
        break;

      case 'goodbye':
        response = ['See you later!', 'Goodbye! Come back anytime.', 'Take care!'][Math.floor(Math.random() * 3)];
        break;

      case 'thanks':
        response = ['You\'re welcome!', 'Happy to help!', 'Anytime!'][Math.floor(Math.random() * 3)];
        break;

      case 'help':
        response = `Here's what I can do:\n\n• **Search Wikipedia** — "what is quantum physics"\n• **DuckDuckGo search** — "search for black holes"\n• **Define words** — "define serendipity"\n• **Solve math** — "calculate 15 * (3 + 2)"\n• **Tell jokes** — "tell me a joke"\n• **Trivia quiz** — "give me trivia"\n• **Number facts** — "number fact 42"\n• **Generate text** — "write about space"\n• **Time/date** — "what time is it"\n\nI'm a local AI — no servers, no tracking. Knowledge comes from Wikipedia, DuckDuckGo, and other free APIs.`;
        break;

      case 'wiki': {
        const wiki = await KnowledgeAPIs.wikipedia(subject);
        if (wiki.summary) {
          this.textGen.learn(wiki.summary);
          response = `**${wiki.title}**\n\n${wiki.summary}`;
          if (wiki.url) response += `\n\n[Read more on Wikipedia](${wiki.url})`;
        } else {
          // Fallback to DuckDuckGo
          const ddg = await KnowledgeAPIs.duckduckgo(subject);
          response = ddg.answer ? `**${ddg.source}**\n\n${ddg.answer}` : `I couldn't find information about "${subject}". Try rephrasing your question.`;
        }
        break;
      }

      case 'search': {
        const ddg = await KnowledgeAPIs.duckduckgo(subject);
        if (ddg.answer) {
          this.textGen.learn(ddg.answer);
          response = `**${ddg.source}**\n\n${ddg.answer}`;
          if (ddg.related.length > 0) response += '\n\n**Related:**\n' + ddg.related.map(r => `• ${r}`).join('\n');
          if (ddg.url) response += `\n\n[Source](${ddg.url})`;
        } else {
          // Try Wikipedia as fallback
          const wiki = await KnowledgeAPIs.wikipedia(subject);
          response = wiki.summary ? `**${wiki.title}** (Wikipedia)\n\n${wiki.summary}` : `No results found for "${subject}".`;
        }
        break;
      }

      case 'dictionary': {
        const wordTarget = userMessage.replace(/^(define|meaning of|what does|mean|definition of|synonym for|antonym of)\s*/i, '').replace(/\s*mean\??$/i, '').trim();
        const def = await KnowledgeAPIs.dictionary(wordTarget || subject);
        if (def) {
          response = `**${def.word}** ${def.phonetic}\n\n`;
          for (const d of def.definitions) {
            response += `*${d.pos}*: ${d.def}\n`;
            if (d.example) response += `  → "${d.example}"\n`;
          }
        } else {
          response = `Couldn't find a definition for "${wordTarget || subject}".`;
        }
        break;
      }

      case 'math': {
        const expr = userMessage.replace(/^(calculate|solve|compute|math|what is|equals?)\s*/i, '').replace(/\?$/, '').trim();
        const result = await KnowledgeAPIs.math(expr);
        response = result ? `**${expr}** = **${result}**` : `Sorry, I couldn't compute "${expr}". Try something like "calculate 5 * (3 + 2)".`;
        break;
      }

      case 'joke': {
        const joke = await KnowledgeAPIs.joke();
        response = joke || 'Why don\'t scientists trust atoms? Because they make up everything!';
        break;
      }

      case 'trivia': {
        const q = await KnowledgeAPIs.trivia();
        response = q || 'Couldn\'t fetch trivia right now. Try again!';
        break;
      }

      case 'generate': {
        const wiki = await KnowledgeAPIs.wikipedia(subject);
        if (wiki.summary) this.textGen.learn(wiki.summary);
        const text = this.textGen.generateAbout(subject, 50);
        response = `*Generated about "${subject}":*\n\n${text}`;
        break;
      }

      case 'time': {
        const now = new Date();
        response = `It's **${now.toLocaleTimeString()}** on **${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}**.`;
        break;
      }

      case 'number': {
        const num = parseInt(userMessage.match(/\d+/)?.[0]) || Math.floor(Math.random() * 100);
        const fact = await KnowledgeAPIs.numberFact(num);
        response = fact ? `**${num}:** ${fact}` : `${num} is a number!`;
        break;
      }

      default: {
        // Try Wikipedia/DDG for anything unrecognized
        const wiki = await KnowledgeAPIs.wikipedia(subject);
        if (wiki.summary) {
          this.textGen.learn(wiki.summary);
          response = `**${wiki.title}**\n\n${wiki.summary}`;
          if (wiki.url) response += `\n\n[Read more](${wiki.url})`;
        } else {
          const ddg = await KnowledgeAPIs.duckduckgo(userMessage);
          response = ddg.answer
            ? `**${ddg.source}**\n\n${ddg.answer}`
            : this.textGen.generate(30);
        }
      }
    }

    this.memory.push({ role: 'assistant', content: response });
    if (this.memory.length > 12) this.memory.shift();
    return response;
  }
}

// ── API Key Auth Prompt (used by chat-interface) ─────────────
function promptAiraiKey() {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.id = 'airai-key-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.75);z-index:99999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);';

    overlay.innerHTML = `
      <div style="background:#1a1a2e;border:1px solid rgba(130,177,255,0.3);border-radius:20px;padding:36px 40px;width:360px;text-align:center;box-shadow:0 24px 60px rgba(0,0,0,0.6);">
        <div style="font-size:36px;margin-bottom:12px;">🤖</div>
        <div style="font-size:20px;font-weight:700;color:#e0e0e0;margin-bottom:6px;">AIrai Engine</div>
        <div style="font-size:13px;color:#888;margin-bottom:24px;">Enter your API key to use the local AI model</div>
        <input id="airai-key-input" type="password" placeholder="API Key" autocomplete="off"
          style="width:100%;padding:12px 16px;border:1px solid rgba(255,255,255,0.15);border-radius:12px;background:rgba(255,255,255,0.05);color:#e0e0e0;font-size:15px;outline:none;box-sizing:border-box;text-align:center;margin-bottom:10px;" />
        <div id="airai-key-error" style="color:#ff5252;font-size:12px;margin-bottom:10px;display:none;">Invalid API key. Try again.</div>
        <button id="airai-key-submit"
          style="width:100%;padding:12px;background:linear-gradient(135deg,#3a86ff,#6a5acd);color:#fff;border:none;border-radius:12px;font-weight:600;font-size:15px;cursor:pointer;margin-bottom:10px;">
          Unlock AIrai
        </button>
        <button id="airai-key-cancel"
          style="width:100%;padding:10px;background:transparent;color:#666;border:1px solid rgba(255,255,255,0.1);border-radius:12px;font-size:13px;cursor:pointer;">
          Cancel
        </button>
      </div>
    `;

    document.body.appendChild(overlay);

    const input = overlay.querySelector('#airai-key-input');
    const errEl = overlay.querySelector('#airai-key-error');
    input.focus();

    function attempt() {
      const key = input.value.trim();
      if (key === AIAssistant.API_KEY) {
        sessionStorage.setItem('airai_engine_key', key);
        overlay.remove();
        resolve(key);
      } else {
        errEl.style.display = 'block';
        input.value = '';
        input.focus();
        setTimeout(() => { errEl.style.display = 'none'; }, 2500);
      }
    }

    overlay.querySelector('#airai-key-submit').addEventListener('click', attempt);
    overlay.querySelector('#airai-key-cancel').addEventListener('click', () => { overlay.remove(); resolve(null); });
    input.addEventListener('keydown', e => { if (e.key === 'Enter') attempt(); });
  });
}

// ── Main entry: handle an airai message call ─────────────────
// Called by chat-interface.html instead of the JSONP Google Script
async function handleAiraiMessage(callbackName, userMessage, startTime) {
  try {
    // Reuse existing instance or create new one
    if (!window._airaiEngine) {
      let key = sessionStorage.getItem('airai_engine_key');
      if (!key) {
        key = await promptAiraiKey();
        if (!key) {
          // User cancelled — fire callback with error
          if (typeof window[callbackName] === 'function') {
            window[callbackName]({ error: 'API key required to use AIrai.' });
          }
          return;
        }
      }
      window._airaiEngine = new AIAssistant(key);
    }

    const response = await window._airaiEngine.chat(userMessage);

    if (typeof window[callbackName] === 'function') {
      window[callbackName]({ content: [{ text: response }] });
    }
  } catch (err) {
    // Reset engine on auth error
    if (err.message.includes('Invalid API key')) {
      window._airaiEngine = null;
      sessionStorage.removeItem('airai_engine_key');
    }
    if (typeof window[callbackName] === 'function') {
      window[callbackName]({ error: err.message });
    }
  }
}
