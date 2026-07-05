(function() {
  'use strict';

  // Find our script tag
  var script = document.currentScript || (function() {
    var scripts = document.getElementsByTagName('script');
    for (var i = scripts.length - 1; i >= 0; i--) {
      if (scripts[i].src && scripts[i].src.indexOf('widget.js') !== -1) return scripts[i];
    }
  })();

  var EMBED_KEY = script && script.getAttribute('data-key');
  var BRAND_COLOR = script && script.getAttribute('data-color') || '#10b981';
  var POSITION = script && script.getAttribute('data-position') || 'right';
  var API_URL = 'https://rcigcarkcpinnniddxcm.supabase.co/functions/v1/widget-chat';

  var DISPENSARY_MENUS = [
    {
      id: 'tripple444',
      label: 'Tripple444 Shop Menu',
      currency: 'R',
      aliases: ['tripple444', 'tripple 444', 'triple444', 'triple 444', 'tripple four', 'triple four'],
      contact: 'WhatsApp 064 543 6734 · tripplefourshophub.online',
      disclaimer: 'Prices in ZAR. Delivery calculated at checkout. Not medical advice.',
      items: [
        { category: 'Flower', name: 'Runtz', size: '1g', price: 180, notes: 'Hybrid · sweet' },
        { category: 'Flower', name: 'Gelato', size: '1g', price: 180, notes: 'Hybrid · relaxing' },
        { category: 'Flower', name: 'Zkittlez', size: '1g', price: 170, notes: 'Indica · calm' },
        { category: 'Flower', name: 'Durban Poison', size: '1g', price: 150, notes: 'Sativa · uplifting' },
        { category: 'Flower', name: 'OG Kush', size: '3.5g', price: 550, notes: 'Hybrid · classic' },
        { category: 'Pre-Rolls', name: 'House Blend Joint', size: '1g', price: 80 },
        { category: 'Pre-Rolls', name: 'Infused Pre-Roll', size: '1.2g', price: 180, notes: 'Kief-coated' },
        { category: 'Edibles', name: 'Gummies', size: '100mg THC', price: 220 },
        { category: 'Edibles', name: 'Chocolate Bar', size: '150mg THC', price: 250 },
        { category: 'Concentrates', name: 'Live Resin', size: '1g', price: 450 },
        { category: 'Concentrates', name: 'Hash', size: '1g', price: 180 },
        { category: 'Vapes', name: '510 Cartridge', size: '0.5g', price: 380 },
        { category: 'CBD', name: 'CBD Oil Tincture', size: '30ml (500mg)', price: 420, notes: 'Wellness' }
      ]
    },
    {
      id: 'leaf-labs',
      label: 'Lëf Labs Wholesale Catalogue',
      currency: 'R',
      aliases: ['leaf labs', 'leaflabs', 'leaf-labs', 'leaf lab', 'lef labs', 'lëf labs', 'lef-labs'],
      contact: 'B2B · 071 806 5754 · tripplefourshophub.online/partners/lef-labs',
      disclaimer: 'Wholesale ZAR pricing (May 2026). COA per batch. B2B partners only. Not medical advice.',
      items: [
        { category: 'Indoor Flower', name: 'Animal Runtz', size: '1g (single-nug)', price: 120, notes: 'Hybrid · Sweet/Fruity' },
        { category: 'Indoor Flower', name: 'Lemon Silver Haze', size: '1g (single-nug)', price: 120, notes: 'Sativa · Citrus/Earthy' },
        { category: 'Indoor Flower', name: 'Guava Bomba', size: '1g (single-nug)', price: 120, notes: 'Hybrid · Tropical/Floral' },
        { category: 'Indoor Flower', name: 'Purple Ghost Candy', size: '1g (single-nug)', price: 120, notes: 'Indica · Berry/Candy' },
        { category: 'Tunnel Flower (AAA)', name: 'Jack Herer', size: '1g', price: 70, notes: 'Sativa · Spicy/Pine' },
        { category: 'Tunnel Flower (AAA)', name: 'Planet of the Grapes', size: '1g', price: 70, notes: 'Indica · Grape/Earthy' },
        { category: 'Tunnel Flower (AAA)', name: 'Gorilla Skittles', size: '1g', price: 70, notes: 'Hybrid · Sweet/Diesel' },
        { category: 'Tunnel Flower (A)', name: 'Cheese', size: '1g', price: 40, notes: 'Hybrid · Sharp/Savoury' },
        { category: 'Tunnel Flower (A)', name: 'Kimbo Kush', size: '1g', price: 40, notes: 'Indica · Coffee/Earthy' },
        { category: 'Tunnel Flower (A)', name: 'Endgame', size: '1g', price: 40, notes: 'Hybrid · Fuel/Sweet' },
        { category: 'Pre-Rolls', name: 'Standard Pre-Roll', size: '1g', price: 35, notes: 'Tunnel popcorn blend' },
        { category: 'Pre-Rolls', name: 'Premium Pre-Roll', size: '1g', price: 55, notes: 'Indoor multi-nug' },
        { category: 'Pre-Rolls', name: 'Moon Stick (infused)', size: '1g', price: 85, notes: 'Indoor + kief coat' },
        { category: 'Pre-Rolls', name: 'Mini 5-Pack', size: '5×0.5g', price: 80, notes: 'Tunnel blend' },
        { category: 'Vapes', name: 'Liquid Gold Disposable', size: '0.5ml', price: 320, notes: 'THC distillate' },
        { category: 'Vapes', name: 'Liquid Gold Disposable', size: '1ml', price: 480, notes: 'THC distillate' },
        { category: 'Vapes', name: 'Liquid Gold 510 Cart', size: '1ml', price: 380, notes: 'THC distillate' },
        { category: 'Vapes', name: 'Pure Leaf Disposable', size: '1ml', price: 400, notes: 'Full spectrum' },
        { category: 'Vapes', name: 'Pure Leaf 510 Cart', size: '1ml', price: 400, notes: 'Full spectrum' },
        { category: 'Vapes', name: 'Pure Leaf Mini Disposable', size: '0.5ml', price: 260, notes: 'Full spectrum' },
        { category: 'Distillates', name: 'THC Distillate', size: '1g', price: 280, notes: '90–95% purity' },
        { category: 'Distillates', name: 'CBD Distillate', size: '1g', price: 180, notes: '80–90% purity' },
        { category: 'Distillates', name: 'Full Spectrum Distillate', size: '1g', price: 160, notes: '70–80% purity' },
        { category: 'Concentrates', name: 'Live Resin', size: '1g', price: 320, notes: '65–80% THC' },
        { category: 'Concentrates', name: 'Wax / Shatter', size: '1g', price: 220, notes: '70–85% THC' },
        { category: 'Concentrates', name: 'Rosin (solventless)', size: '1g', price: 380, notes: '60–75% THC' },
        { category: 'Concentrates', name: 'Kief', size: '1g', price: 120, notes: '40–60% THC' }
      ]
    },
    {
      id: 'dirty-vapes',
      label: 'Dirty Vapes Menu',
      currency: 'R',
      aliases: ['dirty vapes', 'dirtyvapes', 'dirty vape', 'dirty vapes sa', 'dirty vape sa'],
      contact: '074 262 4491 · dirtyvapessa@gmail.com · tripplefourshophub.online/partners/dirty-vapes',
      disclaimer: 'Prices in ZAR (May 2026). 18+ only. Not medical advice.',
      items: [
        { category: 'Edibles', name: 'Dirty Vapes Edibles Tub', size: '100mg', price: 150 },
        { category: 'Vapes', name: 'Dirty Vapes Cart', size: '1ml', price: 350 },
        { category: 'Vapes', name: 'Dirty Vapes Disposable', size: '1ml', price: 450 },
        { category: 'Vapes', name: 'Dirty Vapes SWITCH', size: '2ml', price: 900, notes: 'Pod device' }
      ]
    }
  ];

  function normalizeText(value) {
    return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function matchMenuIntent(text) {
    var lower = normalizeText(text);
    for (var i = 0; i < DISPENSARY_MENUS.length; i++) {
      var menu = DISPENSARY_MENUS[i];
      for (var j = 0; j < menu.aliases.length; j++) {
        if (lower.indexOf(normalizeText(menu.aliases[j])) !== -1) return menu;
      }
    }
    return null;
  }

  if (!EMBED_KEY) {
    console.error('[Cuddles] Missing data-key attribute');
    return;
  }

  // --- Styles ---
  var style = document.createElement('style');
  style.textContent = [
    '#cuddles-widget-btn{position:fixed;bottom:20px;' + POSITION + ':20px;width:60px;height:60px;border-radius:50%;background:' + BRAND_COLOR + ';color:#fff;border:none;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,.25);z-index:99998;display:flex;align-items:center;justify-content:center;transition:transform .2s}',
    '#cuddles-widget-btn:hover{transform:scale(1.1)}',
    '#cuddles-widget-btn svg{width:28px;height:28px}',
    '#cuddles-chat{position:fixed;bottom:90px;' + POSITION + ':20px;width:380px;max-width:calc(100vw - 40px);height:520px;max-height:calc(100vh - 120px);border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.2);z-index:99999;display:none;flex-direction:column;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#1a1a2e}',
    '#cuddles-chat.open{display:flex}',
    '#cuddles-chat-header{background:' + BRAND_COLOR + ';color:#fff;padding:14px 16px;display:flex;align-items:center;gap:10px}',
    '#cuddles-chat-header .avatar{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:18px}',
    '#cuddles-chat-header .info{flex:1}',
    '#cuddles-chat-header .info .name{font-weight:600;font-size:14px}',
    '#cuddles-chat-header .info .status{font-size:11px;opacity:.8}',
    '#cuddles-chat-header .close{background:none;border:none;color:#fff;cursor:pointer;font-size:20px;padding:4px}',
    '#cuddles-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px}',
    '.cuddles-msg{max-width:85%;padding:10px 14px;border-radius:16px;font-size:13px;line-height:1.5;word-wrap:break-word}',
    '.cuddles-msg.assistant{background:#2a2a4a;color:#e0e0e0;border-bottom-left-radius:4px;align-self:flex-start}',
    '.cuddles-msg.user{background:' + BRAND_COLOR + ';color:#fff;border-bottom-right-radius:4px;align-self:flex-end}',
    '.cuddles-msg a{color:' + BRAND_COLOR + ';text-decoration:underline}',
    '.cuddles-msg.user a{color:#fff}',
    '.cuddles-menu{max-width:92%;align-self:flex-start;background:#20203a;color:#eaeaf2;border:1px solid rgba(255,255,255,.12);border-radius:16px;overflow:hidden;font-size:12px;line-height:1.35}',
    '.cuddles-menu-head{background:rgba(255,255,255,.06);padding:10px 12px;display:flex;align-items:center;justify-content:space-between;gap:10px}',
    '.cuddles-menu-title{font-weight:700;font-size:13px;color:#fff}',
    '.cuddles-menu-pdf{border:1px solid rgba(255,255,255,.18);background:' + BRAND_COLOR + ';color:#fff;border-radius:999px;padding:5px 9px;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap}',
    '.cuddles-menu-body{padding:10px 12px;max-height:300px;overflow:auto}',
    '.cuddles-menu-cat{font-size:11px;font-weight:800;color:' + BRAND_COLOR + ';text-transform:uppercase;margin:8px 0 4px;letter-spacing:.04em}',
    '.cuddles-menu-row{display:flex;justify-content:space-between;gap:10px;border-top:1px solid rgba(255,255,255,.08);padding:6px 0}',
    '.cuddles-menu-name{font-weight:650;color:#fff}',
    '.cuddles-menu-meta{opacity:.72;font-size:11px}',
    '.cuddles-menu-price{font-weight:800;color:#fff;white-space:nowrap}',
    '.cuddles-menu-foot{border-top:1px solid rgba(255,255,255,.1);margin-top:8px;padding-top:8px;opacity:.72;font-size:11px}',
    '.cuddles-menu-disclaimer{opacity:.62;font-size:10px;margin-top:4px;font-style:italic}',
    '#cuddles-input-area{padding:12px;border-top:1px solid rgba(255,255,255,.1);display:flex;gap:8px;background:#1a1a2e}',
    '#cuddles-input{flex:1;border:1px solid rgba(255,255,255,.15);border-radius:24px;padding:10px 16px;font-size:13px;background:rgba(255,255,255,.05);color:#e0e0e0;outline:none}',
    '#cuddles-input:focus{border-color:' + BRAND_COLOR + '}',
    '#cuddles-input::placeholder{color:rgba(255,255,255,.35)}',
    '#cuddles-send{width:36px;height:36px;border-radius:50%;border:none;background:' + BRAND_COLOR + ';color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '#cuddles-send:disabled{opacity:.5;cursor:not-allowed}',
    '.cuddles-typing{display:flex;gap:4px;padding:10px 14px;align-self:flex-start}',
    '.cuddles-typing span{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.3);animation:cuddlesBounce .6s infinite alternate}',
    '.cuddles-typing span:nth-child(2){animation-delay:.2s}',
    '.cuddles-typing span:nth-child(3){animation-delay:.4s}',
    '@keyframes cuddlesBounce{to{transform:translateY(-4px);opacity:1}}',
    '.cuddles-powered{text-align:center;padding:6px;font-size:10px;color:rgba(255,255,255,.3)}',
    '.cuddles-powered a{color:rgba(255,255,255,.5);text-decoration:none}',
  ].join('\n');
  document.head.appendChild(style);

  // --- Widget Button ---
  var btn = document.createElement('button');
  btn.id = 'cuddles-widget-btn';
  btn.setAttribute('aria-label', 'Chat with Cuddles AI');
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>';
  document.body.appendChild(btn);

  // --- Chat Window ---
  var chat = document.createElement('div');
  chat.id = 'cuddles-chat';
  chat.innerHTML = [
    '<div id="cuddles-chat-header">',
    '  <div class="avatar">🌿</div>',
    '  <div class="info"><div class="name">Cuddles AI</div><div class="status">Online • Your AI Budtender</div></div>',
    '  <button class="close" aria-label="Close">&times;</button>',
    '</div>',
    '<div id="cuddles-messages"></div>',
    '<div id="cuddles-input-area">',
    '  <input id="cuddles-input" type="text" placeholder="Ask me anything about cannabis..." autocomplete="off" />',
    '  <button id="cuddles-send" disabled aria-label="Send"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>',
    '</div>',
    '<div class="cuddles-powered">Powered by <a href="https://cuddles-ai.com" target="_blank">Cuddles AI</a></div>',
  ].join('');
  document.body.appendChild(chat);

  var messagesEl = document.getElementById('cuddles-messages');
  var inputEl = document.getElementById('cuddles-input');
  var sendBtn = document.getElementById('cuddles-send');
  var closeBtn = chat.querySelector('.close');

  var messages = [];
  var isStreaming = false;

  // Welcome message
  addMessage('assistant', "Hey there! 🌿 I'm Cuddles, your AI budtender. Whether you're looking for help with sleep, creativity, pain relief, or just vibing — I've got you. What can I help with today?");

  // Toggle
  btn.onclick = function() {
    chat.classList.toggle('open');
    if (chat.classList.contains('open')) inputEl.focus();
  };
  closeBtn.onclick = function() { chat.classList.remove('open'); };

  // Input handling
  inputEl.addEventListener('input', function() {
    sendBtn.disabled = !inputEl.value.trim() || isStreaming;
  });
  inputEl.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !sendBtn.disabled) sendMessage();
  });
  sendBtn.onclick = sendMessage;

  function addMessage(role, content) {
    messages.push({ role: role, content: content });
    var div = document.createElement('div');
    div.className = 'cuddles-msg ' + role;
    div.textContent = content;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function(ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
    });
  }

  function groupMenuItems(menu) {
    var groups = {};
    menu.items.forEach(function(item) {
      var category = item.category || 'Menu';
      if (!groups[category]) groups[category] = [];
      groups[category].push(item);
    });
    return groups;
  }

  function addMenuCard(menu) {
    messages.push({ role: 'assistant', content: menu.label + ' displayed', menuId: menu.id });
    var card = document.createElement('div');
    card.className = 'cuddles-menu';
    var groups = groupMenuItems(menu);
    var html = '<div class="cuddles-menu-head"><div class="cuddles-menu-title">📋 ' + escapeHtml(menu.label) + '</div><button type="button" class="cuddles-menu-pdf">PDF</button></div><div class="cuddles-menu-body">';
    Object.keys(groups).forEach(function(category) {
      html += '<div class="cuddles-menu-cat">' + escapeHtml(category) + '</div>';
      groups[category].forEach(function(item) {
        html += '<div class="cuddles-menu-row"><div><div class="cuddles-menu-name">' + escapeHtml(item.name) + '</div>';
        if (item.size || item.notes) html += '<div class="cuddles-menu-meta">' + escapeHtml([item.size, item.notes].filter(Boolean).join(' · ')) + '</div>';
        html += '</div><div class="cuddles-menu-price">' + escapeHtml(menu.currency) + escapeHtml(item.price) + '</div></div>';
      });
    });
    if (menu.contact) html += '<div class="cuddles-menu-foot">' + escapeHtml(menu.contact) + '</div>';
    if (menu.disclaimer) html += '<div class="cuddles-menu-disclaimer">' + escapeHtml(menu.disclaimer) + '</div>';
    html += '</div>';
    card.innerHTML = html;
    card.querySelector('.cuddles-menu-pdf').onclick = function() { downloadMenuPdf(menu); };
    messagesEl.appendChild(card);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return card;
  }

  function downloadMenuPdf(menu) {
    var groups = groupMenuItems(menu);
    var lines = [menu.label, menu.contact || '', ''];
    Object.keys(groups).forEach(function(category) {
      lines.push(category.toUpperCase());
      groups[category].forEach(function(item) {
        lines.push(item.name + (item.size ? ' · ' + item.size : '') + ' — ' + menu.currency + item.price + (item.notes ? ' · ' + item.notes : ''));
      });
      lines.push('');
    });
    if (menu.disclaimer) lines.push(menu.disclaimer);
    var html = '<!doctype html><html><head><meta charset="utf-8"><title>' + escapeHtml(menu.label) + '</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#171521}h1{font-size:22px;margin:0 0 8px}.contact,.disclaimer{color:#666;font-size:12px}.cat{font-weight:700;margin-top:18px;border-bottom:1px solid #ddd;padding-bottom:6px}.row{display:flex;justify-content:space-between;gap:16px;border-bottom:1px solid #eee;padding:7px 0}.meta{color:#666;font-size:12px}.price{font-weight:700;white-space:nowrap}@media print{button{display:none}}</style></head><body><button onclick="window.print()">Save as PDF</button><h1>' + escapeHtml(menu.label) + '</h1>';
    if (menu.contact) html += '<div class="contact">' + escapeHtml(menu.contact) + '</div>';
    Object.keys(groups).forEach(function(category) {
      html += '<div class="cat">' + escapeHtml(category) + '</div>';
      groups[category].forEach(function(item) {
        html += '<div class="row"><div><strong>' + escapeHtml(item.name) + '</strong>';
        if (item.size || item.notes) html += '<div class="meta">' + escapeHtml([item.size, item.notes].filter(Boolean).join(' · ')) + '</div>';
        html += '</div><div class="price">' + escapeHtml(menu.currency) + escapeHtml(item.price) + '</div></div>';
      });
    });
    if (menu.disclaimer) html += '<p class="disclaimer">' + escapeHtml(menu.disclaimer) + '</p>';
    html += '</body></html>';
    var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var win = window.open(url, '_blank');
    if (win) setTimeout(function() { URL.revokeObjectURL(url); }, 10000);
    else {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' }));
      a.download = menu.id + '-menu.txt';
      a.click();
      setTimeout(function() { URL.revokeObjectURL(a.href); }, 10000);
    }
  }

  function showTyping() {
    var div = document.createElement('div');
    div.className = 'cuddles-typing';
    div.id = 'cuddles-typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTyping() {
    var el = document.getElementById('cuddles-typing');
    if (el) el.remove();
  }

  async function sendMessage() {
    var text = inputEl.value.trim();
    if (!text || isStreaming) return;

    inputEl.value = '';
    sendBtn.disabled = true;
    isStreaming = true;

    addMessage('user', text);

    var menu = matchMenuIntent(text);
    if (menu) {
      addMenuCard(menu);
      isStreaming = false;
      sendBtn.disabled = !inputEl.value.trim();
      return;
    }

    showTyping();

    try {
      var resp = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embedKey: EMBED_KEY,
          messages: messages.filter(function(m) { return m.role !== 'system'; }),
        }),
      });

      hideTyping();

      if (!resp.ok) {
        var err = await resp.json().catch(function() { return {}; });
        addMessage('assistant', err.error || 'Sorry, something went wrong. Please try again.');
        isStreaming = false;
        return;
      }

      // Stream SSE response
      var reader = resp.body.getReader();
      var decoder = new TextDecoder();
      var buffer = '';
      var assistantContent = '';
      var assistantDiv = null;

      while (true) {
        var result = await reader.read();
        if (result.done) break;
        buffer += decoder.decode(result.value, { stream: true });

        var newlineIdx;
        while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
          var line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          var jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            var parsed = JSON.parse(jsonStr);
            var delta = parsed.choices && parsed.choices[0] && parsed.choices[0].delta;
            if (delta && delta.content) {
              assistantContent += delta.content;
              if (!assistantDiv) {
                assistantDiv = document.createElement('div');
                assistantDiv.className = 'cuddles-msg assistant';
                messagesEl.appendChild(assistantDiv);
              }
              // Handle order trigger
              var display = assistantContent.replace(/\[ORDER:(\d+)\]/g, function(_, phone) {
                return '\n\n📞 Ready to order? Call us at ' + phone;
              });
              assistantDiv.textContent = display;
              messagesEl.scrollTop = messagesEl.scrollHeight;
            }
          } catch(e) { /* partial JSON, ignore */ }
        }
      }

      if (assistantContent) {
        messages.push({ role: 'assistant', content: assistantContent });
      }
    } catch(e) {
      hideTyping();
      addMessage('assistant', 'Connection error. Please try again.');
    }

    isStreaming = false;
    sendBtn.disabled = !inputEl.value.trim();
  }
})();
