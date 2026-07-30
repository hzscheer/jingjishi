// 主应用逻辑
const App = {
  data: null,
  currentTab: 'home',
  currentNav: 'home',
  currentSubject: '经济基础知识',
  currentView: null,
  currentStage: 'home',
  
  init() {
    this.data = DataStore.load();
    if (this.data.settings.darkMode) {
      document.body.classList.add('dark-mode');
    }
    this.bindEvents();
    this.renderHome();
  },

  bindEvents() {
    // Tab bar
    document.querySelectorAll('.tab-item').forEach(item => {
      item.addEventListener('click', () => {
        const tab = item.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Bottom nav
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const nav = item.dataset.nav;
        this.switchNav(nav);
      });
    });

    // Back button
    document.getElementById('btnBack').addEventListener('click', () => {
      this.goBack();
    });

    // Settings
    document.getElementById('btnSettings').addEventListener('click', () => {
      this.showSettings();
    });
  },

  switchTab(tab) {
    this.currentTab = tab;
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    document.querySelector(`.tab-item[data-tab="${tab}"]`)?.classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    if (tab === 'home') {
      this.currentNav = 'home';
      document.querySelector('.nav-item[data-nav="home"]')?.classList.add('active');
    }
    
    this.currentView = null;
    switch(tab) {
      case 'home': this.renderHome(); break;
      case 'stage1': this.renderStage1(); break;
      case 'stage2': this.renderStage2(); break;
      case 'stage3': this.renderStage3(); break;
      case 'wrong': this.renderWrongQuestions(); break;
    }
  },

  switchNav(nav) {
    this.currentNav = nav;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector(`.nav-item[data-nav="${nav}"]`)?.classList.add('active');
    
    if (nav !== 'home') {
      document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    }
    
    this.currentView = null;
    switch(nav) {
      case 'home': this.renderHome(); break;
      case 'formula': this.renderFormulaLibrary(); break;
      case 'random': this.renderRandomQuiz(); break;
      case 'checkin': this.renderCheckin(); break;
      case 'me': this.renderMe(); break;
    }
  },

  goBack() {
    if (this.currentView) {
      this.currentView = null;
      if (this.currentTab === 'home') {
        this.switchTab('home');
      } else {
        this.switchTab(this.currentTab);
      }
    } else {
      this.switchTab('home');
      this.switchNav('home');
    }
  },

  updateHeader(title, showBack = true) {
    document.getElementById('headerTitle').textContent = title;
    document.getElementById('btnBack').style.display = showBack ? 'block' : 'none';
  },

  getContent() {
    return document.getElementById('mainContent');
  },

  setHTML(html) {
    this.getContent().innerHTML = html;
    this.getContent().scrollTop = 0;
  },

  toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.style.display = 'block';
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => { t.style.display = 'none'; }, 2000);
  },

  // ==================== HOME ====================
  renderHome() {
    this.currentTab = 'home';
    this.currentView = null;
    this.updateHeader('备考工作台', false);
    
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    const homeTab = document.querySelector('.tab-item[data-tab="home"]');
    if (homeTab) homeTab.classList.add('active');

    const d = this.data;
    const stats = this.computeStats();
    
    let html = `<div class="fade-in">`;
    
    // 整体进度卡片
    html += `<div class="card">
      <div class="card-header"><span class="card-title">整体备考进度</span><span class="card-subtitle">距考试 ${this.daysUntilExam()} 天</span></div>
      <div class="stats-grid">
        <div class="stat-item"><div class="stat-value">${stats.totalChapters}</div><div class="stat-label">已学章节</div></div>
        <div class="stat-item"><div class="stat-value success">${stats.masteredPoints}</div><div class="stat-label">已掌握考点</div></div>
        <div class="stat-item"><div class="stat-value">${stats.mqDone}</div><div class="stat-label">已完成母题</div></div>
        <div class="stat-item"><div class="stat-value">${stats.examDone}</div><div class="stat-label">已完成真题</div></div>
        <div class="stat-item"><div class="stat-value danger">${stats.totalWrong}</div><div class="stat-label">总错题数</div></div>
        <div class="stat-item"><div class="stat-value warning">${stats.avgWrongTimes}</div><div class="stat-label">平均错误次数</div></div>
        <div class="stat-item"><div class="stat-value">${stats.mnemonicMastered}</div><div class="stat-label">已学口诀</div></div>
        <div class="stat-item"><div class="stat-value">${stats.formulaMastered}</div><div class="stat-label">已学公式</div></div>
      </div>
    </div>`;

    // 经济基础进度
    html += this.renderSubjectProgress('经济基础知识', stats.ecoStats);
    // 人力资源进度
    html += this.renderSubjectProgress('人力资源管理专业知识和实务', stats.hrStats);

    // 快速入口
    html += `<div class="card">
      <div class="card-title" style="margin-bottom:12px;">快速入口</div>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;">
        <button class="btn btn-primary btn-sm" onclick="App.switchTab('stage1')">考点学习</button>
        <button class="btn btn-outline btn-sm" onclick="App.switchTab('stage2')">母题练习</button>
        <button class="btn btn-outline btn-sm" onclick="App.switchTab('stage3')">真题冲刺</button>
        <button class="btn btn-outline btn-sm" onclick="App.switchTab('wrong')">错题集</button>
        <button class="btn btn-outline btn-sm" onclick="App.switchNav('random')">随机组题</button>
        <button class="btn btn-outline btn-sm" onclick="App.switchNav('checkin')">每日打卡</button>
      </div>
    </div>`;

    html += `</div>`;
    this.setHTML(html);
    this.updateHeader('备考工作台', false);
  },

  renderSubjectProgress(subject, stats) {
    const shortName = subject === '经济基础知识' ? '经济基础' : '人力资源管理';
    const stageColor = subject === '经济基础知识' ? 'stage1' : 'stage2';
    
    return `<div class="card">
      <div class="card-header"><span class="card-title">${shortName}</span></div>
      <div class="progress-info"><span>第一阶段-考点</span><span>${stats.pointProgress}%</span></div>
      <div class="progress-bar"><div class="progress-fill ${stageColor}" style="width:${stats.pointProgress}%"></div></div>
      <div class="progress-info"><span>第二阶段-母题</span><span>${stats.mqProgress}%</span></div>
      <div class="progress-bar"><div class="progress-fill ${stageColor}" style="width:${stats.mqProgress}%"></div></div>
      <div class="progress-info"><span>第三阶段-真题</span><span>${stats.examProgress}%</span></div>
      <div class="progress-bar"><div class="progress-fill ${stageColor}" style="width:${stats.examProgress}%"></div></div>
      <div style="display:flex;gap:16px;margin-top:8px;font-size:var(--font-size-xs);color:var(--text-muted);">
        <span>错题: ${stats.wrongCount}</span>
        <span>口诀: ${stats.mnemonicCount}</span>
        <span>公式: ${stats.formulaCount}</span>
      </div>
    </div>`;
  },

  computeStats() {
    const d = this.data;
    let totalChapters = 0, masteredPoints = 0, totalPoints = 0;
    let mqDone = 0, mqTotal = 0, examDone = 0, examTotal = 0;
    let ecoStats = { pointProgress:0, mqProgress:0, examProgress:0, wrongCount:0, mnemonicCount:0, formulaCount:0 };
    let hrStats = { pointProgress:0, mqProgress:0, examProgress:0, wrongCount:0, mnemonicCount:0, formulaCount:0 };

    for (const subject of ['经济基础知识', '人力资源管理专业知识和实务']) {
      const isEco = subject === '经济基础知识';
      let sTotalCh = 0, sMastered = 0, sTotalP = 0;
      
      if (d.points[subject]?.chapters) {
        d.points[subject].chapters.forEach(ch => {
          sTotalCh++;
          ch.points.forEach(p => {
            sTotalP++;
            if (p.mastered) sMastered++;
          });
        });
      }
      totalChapters += sTotalCh;
      masteredPoints += sMastered;
      totalPoints += sTotalP;
      
      let sMqDone = 0, sMqTotal = 0;
      if (d.motherQuestions[subject]?.chapters) {
        d.motherQuestions[subject].chapters.forEach(ch => {
          sMqTotal += ch.questions.length;
        });
      }
      const mqAnswers = JSON.parse(localStorage.getItem('mq_answers') || '{}');
      for (const ch of (d.motherQuestions[subject]?.chapters || [])) {
        for (const q of ch.questions) {
          if (mqAnswers[q.id] !== undefined) sMqDone++;
        }
      }
      mqDone += sMqDone;
      mqTotal += sMqTotal;

      let sExamDone = 0, sExamTotal = 0;
      if (d.examPapers[subject]?.years) {
        d.examPapers[subject].years.forEach(y => {
          y.papers.forEach(p => sExamTotal += p.questions.length);
        });
      }
      const examAnswers = JSON.parse(localStorage.getItem('exam_answers') || '{}');
      for (const y of (d.examPapers[subject]?.years || [])) {
        for (const p of y.papers) {
          for (const q of p.questions) {
            if (examAnswers[q.id] !== undefined) sExamDone++;
          }
        }
      }
      examDone += sExamDone;
      examTotal += sExamTotal;

      const wrongForSub = d.wrongQuestions.filter(w => w.subject === subject);
      const mnemonicForSub = d.mnemonics.filter(m => m.subject === subject);
      const formulaForSub = d.formulas.filter(f => f.subject === subject);

      const target = isEco ? ecoStats : hrStats;
      target.pointProgress = sTotalP > 0 ? Math.round((sMastered / sTotalP) * 100) : 0;
      target.mqProgress = sMqTotal > 0 ? Math.round((sMqDone / sMqTotal) * 100) : 0;
      target.examProgress = sExamTotal > 0 ? Math.round((sExamDone / sExamTotal) * 100) : 0;
      target.wrongCount = wrongForSub.length;
      target.mnemonicCount = mnemonicForSub.length;
      target.formulaCount = formulaForSub.length;
    }

    const totalWrong = d.wrongQuestions.length;
    const avgWrongTimes = totalWrong > 0 
      ? (d.wrongQuestions.reduce((s, w) => s + (w.errorCount || 1), 0) / totalWrong).toFixed(1)
      : '0';

    return {
      totalChapters, masteredPoints, totalPoints,
      mqDone, mqTotal, examDone, examTotal,
      totalWrong, avgWrongTimes,
      mnemonicMastered: d.mnemonics.length,
      formulaMastered: d.formulas.length,
      ecoStats, hrStats
    };
  },

  daysUntilExam() {
    const exam = new Date(2026, 10, 7); // Nov 7, 2026
    const today = new Date();
    const diff = Math.ceil((exam - today) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  },

  // ==================== STAGE 1 - 考点学习 ====================
  renderStage1() {
    this.currentTab = 'stage1';
    this.currentView = null;
    this.updateHeader('考点学习', false);
    
    const d = this.data;
    const chapters = d.points[this.currentSubject]?.chapters || [];
    
    let html = `<div class="fade-in">`;
    html += `<div class="subject-tabs">
      <div class="subject-tab ${this.currentSubject==='经济基础知识'?'active':''}" 
           onclick="App.setSubject('经济基础知识');App.renderStage1()">经济基础</div>
      <div class="subject-tab ${this.currentSubject==='人力资源管理专业知识和实务'?'active':''}" 
           onclick="App.setSubject('人力资源管理专业知识和实务');App.renderStage1()">人力资源</div>
    </div>`;

    if (chapters.length === 0) {
      html += `<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-text">暂无考点数据，请在数据管理模块导入</div></div>`;
    } else {
      chapters.forEach((ch, ci) => {
        const mastered = ch.points.filter(p => p.mastered).length;
        html += `<div class="chapter-item">
          <div class="chapter-header" onclick="App.toggleChapter(this, 'stage1-ch-${ci}')">
            <div class="chapter-header-left">
              <div class="chapter-icon stage1">${ci+1}</div>
              <div>
                <div class="chapter-name">${ch.name}</div>
                <div class="chapter-count">${ch.points.length}个考点</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="chapter-stats">掌握 ${mastered}/${ch.points.length}</span>
              <span class="chapter-arrow">▶</span>
            </div>
          </div>
          <div class="chapter-body" id="stage1-ch-${ci}">`;
        
        ch.points.forEach((p, pi) => {
          html += `<div class="point-item">
            <div class="point-num">${pi+1}</div>
            <div class="point-title" onclick="App.showPointDetail('${this.currentSubject}','${ch.id}','${p.id}')">${p.title}</div>
            <div class="point-status">
              <span class="status-badge ${p.mastered?'mastered':'unmastered'}">${p.mastered?'已掌握':'未掌握'}</span>
              <button class="toggle-btn ${p.mastered?'mastered':''}" onclick="event.stopPropagation();App.togglePoint('${this.currentSubject}','${ch.id}','${p.id}')"></button>
            </div>
          </div>`;
        });
        
        html += `</div></div>`;
      });
    }
    
    html += `</div>`;
    this.setHTML(html);
  },

  setSubject(subject) {
    this.currentSubject = subject;
  },

  toggleChapter(header, bodyId) {
    const body = document.getElementById(bodyId);
    const arrow = header.querySelector('.chapter-arrow');
    if (body) {
      body.classList.toggle('open');
      if (arrow) arrow.classList.toggle('open');
    }
  },

  togglePoint(subject, chId, pId) {
    const chapters = this.data.points[subject]?.chapters;
    if (!chapters) return;
    for (const ch of chapters) {
      if (ch.id === chId) {
        const p = ch.points.find(p => p.id === pId);
        if (p) {
          p.mastered = !p.mastered;
          DataStore.save(this.data);
          this.renderStage1();
          return;
        }
      }
    }
  },

  showPointDetail(subject, chId, pId) {
    const chapters = this.data.points[subject]?.chapters;
    if (!chapters) return;
    let point = null, chName = '';
    for (const ch of chapters) {
      if (ch.id === chId) {
        point = ch.points.find(p => p.id === pId);
        chName = ch.name;
        break;
      }
    }
    if (!point) return;

    const mnemonics = this.data.mnemonics.filter(m => 
      m.subject === subject && m.chapter === chName
    );
    const formulas = this.data.formulas.filter(f =>
      f.subject === subject && f.chapter === chName
    );

    let html = `<div class="detail-overlay" onclick="if(event.target===this)App.closeDetail()">
      <div class="detail-sheet">
        <div class="detail-handle"></div>
        <div class="detail-title">${point.title}</div>
        <div class="detail-content">考点内容：${point.title}</div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
          <span>掌握状态：</span>
          <span class="status-badge ${point.mastered?'mastered':'unmastered'}">${point.mastered?'已掌握':'未掌握'}</span>
          <button class="toggle-btn ${point.mastered?'mastered':''}" onclick="App.togglePointFromDetail('${subject}','${chId}','${pId}')"></button>
        </div>`;
    
    if (mnemonics.length > 0) {
      html += `<div class="detail-section"><div class="detail-section-title">💡 相关口诀</div>`;
      mnemonics.forEach(m => {
        html += `<div class="detail-section-content" style="white-space:pre-line;margin-bottom:6px;">${m.content}</div>`;
      });
      html += `</div>`;
    }
    
    if (formulas.length > 0) {
      html += `<div class="detail-section"><div class="detail-section-title">📐 相关公式</div>`;
      formulas.forEach(f => {
        html += `<div class="detail-section-content" style="white-space:pre-line;margin-bottom:6px;">${f.content}</div>`;
      });
      html += `</div>`;
    }

    html += `<button class="detail-close" onclick="App.closeDetail()">关闭</button></div></div>`;
    
    const overlay = document.getElementById('modalOverlay');
    const content = document.getElementById('modalContent');
    overlay.style.display = 'block';
    content.style.display = 'block';
    content.innerHTML = html;
    
    overlay.onclick = () => this.closeDetail();
  },

  togglePointFromDetail(subject, chId, pId) {
    this.togglePoint(subject, chId, pId);
    const chapters = this.data.points[subject]?.chapters;
    let point = null, chName = '';
    for (const ch of chapters) {
      if (ch.id === chId) {
        point = ch.points.find(p => p.id === pId);
        chName = ch.name;
        break;
      }
    }
    if (point) {
      this.showPointDetail(subject, chId, pId);
    }
  },

  closeDetail() {
    document.getElementById('modalOverlay').style.display = 'none';
    document.getElementById('modalContent').style.display = 'none';
    document.getElementById('modalContent').innerHTML = '';
  },

  // ==================== STAGE 2 - 母题练习 ====================
  renderStage2() {
    this.currentTab = 'stage2';
    this.currentView = null;
    this.updateHeader('母题练习', false);
    
    const d = this.data;
    const chapters = d.motherQuestions[this.currentSubject]?.chapters || [];
    const answers = JSON.parse(localStorage.getItem('mq_answers') || '{}');
    
    let html = `<div class="fade-in">`;
    html += `<div class="subject-tabs">
      <div class="subject-tab ${this.currentSubject==='经济基础知识'?'active':''}" 
           onclick="App.setSubject('经济基础知识');App.renderStage2()">经济基础</div>
      <div class="subject-tab ${this.currentSubject==='人力资源管理专业知识和实务'?'active':''}" 
           onclick="App.setSubject('人力资源管理专业知识和实务');App.renderStage2()">人力资源</div>
    </div>`;

    if (chapters.length === 0) {
      html += `<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-text">暂无母题数据，请在数据管理模块导入</div></div>`;
    } else {
      chapters.forEach((ch, ci) => {
        const done = ch.questions.filter(q => answers[q.id] !== undefined).length;
        html += `<div class="chapter-item">
          <div class="chapter-header" onclick="App.toggleChapter(this, 'stage2-ch-${ci}')">
            <div class="chapter-header-left">
              <div class="chapter-icon stage2">${ci+1}</div>
              <div>
                <div class="chapter-name">${ch.name}</div>
                <div class="chapter-count">${ch.questions.length}道母题</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="chapter-stats">已完成 ${done}/${ch.questions.length}</span>
              <span class="chapter-arrow">▶</span>
            </div>
          </div>
          <div class="chapter-body" id="stage2-ch-${ci}">`;
        
        ch.questions.forEach((q, qi) => {
          const userAns = answers[q.id];
          const isDone = userAns !== undefined;
          const isCorrect = userAns === q.answer;
          html += `<div class="point-item">
            <div class="point-num">${qi+1}</div>
            <div class="point-title" onclick="App.showQuizDetail('mq','${this.currentSubject}','${ch.id}','${q.id}')">
              ${q.question}
            </div>
            <div class="point-status">
              ${isDone ? (isCorrect ? '<span class="status-badge mastered">✓ 正确</span>' : '<span class="status-badge unmastered">✗ 错误</span>') : '<span class="status-badge" style="background:#F0F0F0;color:#999;">未答</span>'}
            </div>
          </div>`;
        });
        
        html += `<div style="text-align:center;padding:8px;">
          <button class="btn btn-primary btn-sm" onclick="App.startMQPractice('${this.currentSubject}','${ch.id}')">开始本章练习</button>
        </div></div></div>`;
      });
    }
    
    html += `</div>`;
    this.setHTML(html);
  },

  startMQPractice(subject, chId) {
    const chapters = this.data.motherQuestions[subject]?.chapters;
    if (!chapters) return;
    const ch = chapters.find(c => c.id === chId);
    if (!ch) return;
    
    this.currentView = { type: 'mq', subject, chId };
    this.updateHeader('母题练习', true);
    
    const answers = JSON.parse(localStorage.getItem('mq_answers') || '{}');
    let html = `<div class="fade-in quiz-container">`;
    
    ch.questions.forEach((q, qi) => {
      const userAns = answers[q.id];
      const answered = userAns !== undefined;
      html += `<div class="quiz-card" id="mq-card-${q.id}">
        <div class="quiz-num">第 ${qi+1}/${ch.questions.length} 题</div>
        <div class="quiz-question">${q.question}</div>`;
      
      q.options.forEach((opt, oi) => {
        let cls = 'quiz-option';
        if (answered) {
          if (oi === q.answer) cls += ' correct';
          else if (oi === userAns) cls += ' wrong';
        }
        html += `<button class="${cls}" onclick="App.answerMQ('${q.id}',${oi})" ${answered?'disabled':''}>${opt}</button>`;
      });
      
      if (answered) {
        const isCorrect = userAns === q.answer;
        html += `<div class="quiz-answer">
          <span class="${isCorrect?'correct-text':'wrong-text'}">${isCorrect?'✓ 回答正确！':'✗ 回答错误'}</span>
          <div style="margin-top:8px;"><strong>解析：</strong>${q.analysis}</div>`;
        
        const chName = ch.name;
        const mnemonics = this.data.mnemonics.filter(m => m.subject === subject && m.chapter === chName);
        const formulas = this.data.formulas.filter(f => f.subject === subject && f.chapter === chName);
        
        if (mnemonics.length > 0) {
          html += `<div style="margin-top:8px;font-size:var(--font-size-sm);"><strong>💡 口诀：</strong>${mnemonics.map(m=>m.content).join('；')}</div>`;
        }
        if (formulas.length > 0) {
          html += `<div style="margin-top:4px;font-size:var(--font-size-sm);"><strong>📐 公式：</strong>${formulas.map(f=>f.content).join('；')}</div>`;
        }
        html += `</div>`;
      }
      
      html += `</div>`;
    });
    
    html += `</div>`;
    this.setHTML(html);
    
    // Scroll to first unanswered
    const firstUnanswered = ch.questions.find(q => answers[q.id] === undefined);
    if (firstUnanswered) {
      setTimeout(() => {
        document.getElementById(`mq-card-${firstUnanswered.id}`)?.scrollIntoView({behavior:'smooth',block:'center'});
      }, 100);
    }
  },

  answerMQ(qId, userAns) {
    const answers = JSON.parse(localStorage.getItem('mq_answers') || '{}');
    answers[qId] = userAns;
    localStorage.setItem('mq_answers', JSON.stringify(answers));
    
    // Find the question
    let question = null, subject = '', chName = '';
    for (const sub of ['经济基础知识', '人力资源管理专业知识和实务']) {
      for (const ch of (this.data.motherQuestions[sub]?.chapters || [])) {
        const q = ch.questions.find(q => q.id === qId);
        if (q) { question = q; subject = sub; chName = ch.name; break; }
      }
      if (question) break;
    }
    
    // Add to wrong questions if incorrect
    if (question && userAns !== question.answer) {
      this.addWrongQuestion({
        id: qId,
        subject,
        chapter: chName,
        type: 'mother',
        stage: 'stage2',
        question: question.question,
        options: question.options,
        answer: question.answer,
        analysis: question.analysis,
        userAnswer: userAns,
        sourceId: qId
      });
    }
    
    this.toast(userAns === question?.answer ? '回答正确！' : '回答错误，已加入错题集');
    this.data = DataStore.load();
    
    // Rerender current view
    if (this.currentView?.type === 'mq') {
      this.startMQPractice(this.currentView.subject, this.currentView.chId);
    }
  },

  // ==================== STAGE 3 - 真题冲刺 ====================
  renderStage3() {
    this.currentTab = 'stage3';
    this.currentView = null;
    this.updateHeader('真题冲刺', false);
    
    const d = this.data;
    const years = d.examPapers[this.currentSubject]?.years || [];
    
    let html = `<div class="fade-in">`;
    html += `<div class="subject-tabs">
      <div class="subject-tab ${this.currentSubject==='经济基础知识'?'active':''}" 
           onclick="App.setSubject('经济基础知识');App.renderStage3()">经济基础</div>
      <div class="subject-tab ${this.currentSubject==='人力资源管理专业知识和实务'?'active':''}" 
           onclick="App.setSubject('人力资源管理专业知识和实务');App.renderStage3()">人力资源</div>
    </div>`;

    if (years.length === 0) {
      html += `<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-text">暂无真题数据，请在数据管理模块导入</div></div>`;
    } else {
      years.sort((a,b) => b.year - a.year).forEach(y => {
        html += `<div class="card">
          <div class="card-header"><span class="card-title">${y.year}年真题</span></div>`;
        
        y.papers.forEach(p => {
          const examAnswers = JSON.parse(localStorage.getItem('exam_answers') || '{}');
          const done = p.questions.filter(q => examAnswers[q.id] !== undefined).length;
          html += `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);">
            <div>
              <div style="font-size:var(--font-size-md);font-weight:500;">${p.name}</div>
              <div style="font-size:var(--font-size-xs);color:var(--text-muted);">${p.questions.length}题 | 已完成${done}题</div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="App.startExamPractice('${this.currentSubject}','${p.id}')">开始练习</button>
          </div>`;
        });
        
        html += `</div>`;
      });
    }
    
    html += `</div>`;
    this.setHTML(html);
  },

  startExamPractice(subject, paperId) {
    const years = this.data.examPapers[subject]?.years;
    if (!years) return;
    let paper = null;
    for (const y of years) {
      for (const p of y.papers) {
        if (p.id === paperId) { paper = p; break; }
      }
      if (paper) break;
    }
    if (!paper) return;
    
    this.currentView = { type: 'exam', subject, paperId };
    this.updateHeader('真题练习', true);
    
    const answers = JSON.parse(localStorage.getItem('exam_answers') || '{}');
    let html = `<div class="fade-in quiz-container">`;
    html += `<div class="paper-header"><div class="paper-title">${paper.name}</div><div class="paper-meta">共 ${paper.questions.length} 题</div></div>`;
    
    paper.questions.forEach((q, qi) => {
      const userAns = answers[q.id];
      const answered = userAns !== undefined;
      html += `<div class="quiz-card" id="exam-card-${q.id}">
        <div class="quiz-num">第 ${qi+1}/${paper.questions.length} 题</div>
        <div class="quiz-question">${q.question}</div>`;
      
      q.options.forEach((opt, oi) => {
        let cls = 'quiz-option';
        if (answered) {
          if (oi === q.answer) cls += ' correct';
          else if (oi === userAns) cls += ' wrong';
        }
        html += `<button class="${cls}" onclick="App.answerExam('${q.id}',${oi})" ${answered?'disabled':''}>${opt}</button>`;
      });
      
      if (answered) {
        const isCorrect = userAns === q.answer;
        html += `<div class="quiz-answer">
          <span class="${isCorrect?'correct-text':'wrong-text'}">${isCorrect?'✓ 正确':'✗ 错误'}</span>
          <div style="margin-top:8px;"><strong>解析：</strong>${q.analysis}</div></div>`;
      }
      html += `</div>`;
    });
    
    html += `<div style="text-align:center;padding:12px;">
      <button class="btn btn-success" onclick="App.showExamResult('${subject}','${paperId}')">查看得分报告</button>
    </div></div>`;
    this.setHTML(html);
  },

  answerExam(qId, userAns) {
    const answers = JSON.parse(localStorage.getItem('exam_answers') || '{}');
    answers[qId] = userAns;
    localStorage.setItem('exam_answers', JSON.stringify(answers));
    
    let question = null, subject = '', chName = '';
    for (const sub of ['经济基础知识', '人力资源管理专业知识和实务']) {
      const years = this.data.examPapers[sub]?.years;
      if (!years) continue;
      for (const y of years) {
        for (const p of y.papers) {
          const q = p.questions.find(q => q.id === qId);
          if (q) { question = q; subject = sub; break; }
        }
        if (question) break;
      }
      if (question) break;
    }
    
    if (question && userAns !== question.answer) {
      this.addWrongQuestion({
        id: qId,
        subject,
        chapter: `真题-${qId}`,
        type: 'exam',
        stage: 'stage3',
        question: question.question,
        options: question.options,
        answer: question.answer,
        analysis: question.analysis,
        userAnswer: userAns,
        sourceId: qId
      });
    }
    
    this.toast(userAns === question?.answer ? '回答正确！' : '回答错误');
    this.data = DataStore.load();
    
    if (this.currentView?.type === 'exam') {
      this.startExamPractice(this.currentView.subject, this.currentView.paperId);
    }
  },

  showExamResult(subject, paperId) {
    const years = this.data.examPapers[subject]?.years;
    if (!years) return;
    let paper = null;
    for (const y of years) {
      for (const p of y.papers) {
        if (p.id === paperId) { paper = p; break; }
      }
      if (paper) break;
    }
    if (!paper) return;
    
    const answers = JSON.parse(localStorage.getItem('exam_answers') || '{}');
    let correct = 0, wrong = 0, unanswered = 0;
    paper.questions.forEach(q => {
      const ua = answers[q.id];
      if (ua === undefined) unanswered++;
      else if (ua === q.answer) correct++;
      else wrong++;
    });
    
    const total = paper.questions.length;
    const score = Math.round((correct / total) * 100);
    
    const scoreId = `exam-${paperId}`;
    if (!this.data.stats.examPaperScores) this.data.stats.examPaperScores = {};
    this.data.stats.examPaperScores[scoreId] = { correct, wrong, unanswered, total, score, date: new Date().toISOString() };
    DataStore.save(this.data);
    
    let html = `<div class="detail-overlay" onclick="if(event.target===this)App.closeDetail()">
      <div class="detail-sheet">
        <div class="detail-handle"></div>
        <div class="paper-header">
          <div class="score-circle"><div class="score-num">${score}</div><div class="score-label">分</div></div>
          <div class="paper-title">${paper.name}</div>
        </div>
        <div class="result-summary">
          <div class="result-item"><div class="result-value r-total">${total}</div><div>总题数</div></div>
          <div class="result-item"><div class="result-value r-correct">${correct}</div><div>正确</div></div>
          <div class="result-item"><div class="result-value r-wrong">${wrong}</div><div>错误</div></div>
        </div>
        <div style="font-size:var(--font-size-sm);color:var(--text-muted);text-align:center;">未答: ${unanswered}题</div>`;
    
    if (wrong > 0) {
      html += `<div class="detail-section" style="margin-top:12px;">
        <div class="detail-section-title">❌ 错题回顾</div>`;
      paper.questions.forEach(q => {
        const ua = answers[q.id];
        if (ua !== undefined && ua !== q.answer) {
          html += `<div style="font-size:var(--font-size-sm);margin-bottom:8px;padding:8px;background:var(--danger-bg);border-radius:6px;">
            <div><strong>${q.question}</strong></div>
            <div style="color:var(--danger);">你的答案: ${q.options[ua]}</div>
            <div style="color:var(--success);">正确答案: ${q.options[q.answer]}</div>
          </div>`;
        }
      });
      html += `</div>`;
    }
    
    html += `<button class="detail-close" onclick="App.closeDetail()">关闭</button></div></div>`;
    
    document.getElementById('modalOverlay').style.display = 'block';
    document.getElementById('modalContent').style.display = 'block';
    document.getElementById('modalContent').innerHTML = html;
    document.getElementById('modalOverlay').onclick = () => this.closeDetail();
  },

  // ==================== 错题集 ====================
  renderWrongQuestions() {
    this.currentTab = 'wrong';
    this.currentView = null;
    this.updateHeader('错题集', false);
    
    const d = this.data;
    let wrong = [...d.wrongQuestions];
    
    let html = `<div class="fade-in">`;
    
    // Filters
    html += `<div class="filter-chips">
      <span class="filter-chip active" onclick="App.filterWrong('all',this)">全部 (${wrong.length})</span>
      <span class="filter-chip" onclick="App.filterWrong('经济基础知识',this)">经济基础</span>
      <span class="filter-chip" onclick="App.filterWrong('人力资源管理专业知识和实务',this)">人力资源</span>
      <span class="filter-chip" onclick="App.filterWrong('stage1',this)">第一阶段</span>
      <span class="filter-chip" onclick="App.filterWrong('stage2',this)">第二阶段</span>
      <span class="filter-chip" onclick="App.filterWrong('stage3',this)">第三阶段</span>
    </div>`;
    
    html += `<div id="wrong-list">`;
    html += this.renderWrongList(wrong);
    html += `</div>`;
    
    if (wrong.length > 0) {
      html += `<div style="text-align:center;padding:12px;">
        <button class="btn btn-danger btn-sm" onclick="App.clearWrongQuestions()">清空全部错题</button>
      </div>`;
    }
    
    html += `</div>`;
    this.setHTML(html);
  },

  renderWrongList(wrong) {
    if (wrong.length === 0) {
      return `<div class="empty-state"><div class="empty-icon">✨</div><div class="empty-text">暂无错题，继续加油！</div></div>`;
    }
    
    let html = '';
    wrong.forEach((w, i) => {
      const stageLabel = w.stage === 'stage1' ? '考点' : w.stage === 'stage2' ? '母题' : '真题';
      const stageCls = w.stage === 'stage1' ? 'stage1' : w.stage === 'stage2' ? 'stage2' : 'stage3';
      html += `<div class="card" style="padding:12px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
          <div style="flex:1;">
            <div style="display:flex;gap:6px;margin-bottom:6px;flex-wrap:wrap;">
              <span class="status-badge unmastered">${stageLabel}</span>
              <span style="font-size:var(--font-size-xs);color:var(--text-muted);">${w.subject} · ${w.chapter}</span>
              <span style="font-size:var(--font-size-xs);color:var(--danger);">错误 ${w.errorCount||1} 次</span>
            </div>
            <div style="font-size:var(--font-size-md);font-weight:500;margin-bottom:4px;">${w.question}</div>
            <div style="font-size:var(--font-size-sm);color:var(--danger);">你的答案: ${w.options[w.userAnswer]}</div>
            <div style="font-size:var(--font-size-sm);color:var(--success);">正确答案: ${w.options[w.answer]}</div>
          </div>
        </div>
        <div style="margin-top:8px;">
          <button class="btn btn-outline btn-sm" onclick="App.showWrongDetail('${w.id}')">查看详情</button>
          <button class="btn btn-primary btn-sm" onclick="App.retryWrong('${w.id}')" style="margin-left:6px;">重新作答</button>
        </div>
      </div>`;
    });
    return html;
  },

  filterWrong(filter, el) {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    if (el) el.classList.add('active');
    
    let wrong = [...this.data.wrongQuestions];
    if (filter === 'all') {
      // no filter
    } else if (filter === '经济基础知识' || filter === '人力资源管理专业知识和实务') {
      wrong = wrong.filter(w => w.subject === filter);
    } else {
      wrong = wrong.filter(w => w.stage === filter);
    }
    
    document.getElementById('wrong-list').innerHTML = this.renderWrongList(wrong);
  },

  showWrongDetail(wrongId) {
    const w = this.data.wrongQuestions.find(w => w.id === wrongId);
    if (!w) return;
    
    const mnemonics = this.data.mnemonics.filter(m => m.subject === w.subject && m.chapter === w.chapter);
    const formulas = this.data.formulas.filter(f => f.subject === w.subject && f.chapter === w.chapter);
    
    let html = `<div class="detail-overlay" onclick="if(event.target===this)App.closeDetail()">
      <div class="detail-sheet">
        <div class="detail-handle"></div>
        <div class="detail-title">错题详情</div>
        <div class="detail-content"><strong>题目：</strong>${w.question}</div>
        <div style="margin-bottom:8px;"><span style="color:var(--danger);">你的答案：${w.options[w.userAnswer]}</span></div>
        <div style="margin-bottom:8px;"><span style="color:var(--success);">正确答案：${w.options[w.answer]}</span></div>
        <div class="detail-section"><div class="detail-section-content"><strong>解析：</strong>${w.analysis}</div></div>`;
    
    if (mnemonics.length > 0) {
      html += `<div class="detail-section"><div class="detail-section-title">💡 相关口诀</div>`;
      mnemonics.forEach(m => {
        html += `<div class="detail-section-content" style="white-space:pre-line;">${m.content}</div>`;
      });
      html += `</div>`;
    }
    if (formulas.length > 0) {
      html += `<div class="detail-section"><div class="detail-section-title">📐 相关公式</div>`;
      formulas.forEach(f => {
        html += `<div class="detail-section-content" style="white-space:pre-line;">${f.content}</div>`;
      });
      html += `</div>`;
    }
    
    html += `<button class="detail-close" onclick="App.closeDetail()">关闭</button></div></div>`;
    
    document.getElementById('modalOverlay').style.display = 'block';
    document.getElementById('modalContent').style.display = 'block';
    document.getElementById('modalContent').innerHTML = html;
    document.getElementById('modalOverlay').onclick = () => this.closeDetail();
  },

  retryWrong(wrongId) {
    const w = this.data.wrongQuestions.find(w => w.id === wrongId);
    if (!w) return;
    
    let html = `<div class="detail-overlay" onclick="if(event.target===this)App.closeDetail()">
      <div class="detail-sheet">
        <div class="detail-handle"></div>
        <div class="quiz-question">${w.question}</div>`;
    
    w.options.forEach((opt, oi) => {
      html += `<button class="quiz-option" onclick="App.submitRetry('${w.id}',${oi})">${opt}</button>`;
    });
    
    html += `<div id="retry-result-${w.id}"></div>`;
    html += `<button class="detail-close" onclick="App.closeDetail()">关闭</button></div></div>`;
    
    document.getElementById('modalOverlay').style.display = 'block';
    document.getElementById('modalContent').style.display = 'block';
    document.getElementById('modalContent').innerHTML = html;
    document.getElementById('modalOverlay').onclick = () => this.closeDetail();
  },

  submitRetry(wrongId, userAns) {
    const w = this.data.wrongQuestions.find(w => w.id === wrongId);
    if (!w) return;
    
    const isCorrect = userAns === w.answer;
    const resultDiv = document.getElementById(`retry-result-${wrongId}`);
    
    // Disable all buttons
    document.querySelectorAll('#modalContent .quiz-option').forEach(b => {
      b.disabled = true;
      const optIdx = parseInt(b.textContent.charAt(0)) - 1;
      if (optIdx === w.answer) b.classList.add('correct');
      if (optIdx === userAns && !isCorrect) b.classList.add('wrong');
    });
    
    if (isCorrect) {
      w.errorCount = Math.max(0, (w.errorCount || 1) - 1);
      if (w.errorCount === 0) {
        this.data.wrongQuestions = this.data.wrongQuestions.filter(x => x.id !== wrongId);
      }
      resultDiv.innerHTML = `<div class="quiz-answer"><span class="correct-text">✓ 回答正确！</span></div>`;
    } else {
      w.errorCount = (w.errorCount || 1) + 1;
      resultDiv.innerHTML = `<div class="quiz-answer"><span class="wrong-text">✗ 还是错了</span><div>正确答案：${w.options[w.answer]}</div></div>`;
    }
    
    DataStore.save(this.data);
  },

  addWrongQuestion(w) {
    const existing = this.data.wrongQuestions.find(x => x.id === w.id);
    if (existing) {
      existing.errorCount = (existing.errorCount || 1) + 1;
    } else {
      w.errorCount = 1;
      this.data.wrongQuestions.push(w);
    }
    DataStore.save(this.data);
  },

  clearWrongQuestions() {
    if (confirm('确定要清空所有错题吗？此操作不可恢复。')) {
      this.data.wrongQuestions = [];
      DataStore.save(this.data);
      this.renderWrongQuestions();
      this.toast('错题已清空');
    }
  },

  // ==================== 随机组题 ====================
  renderRandomQuiz() {
    this.currentNav = 'random';
    this.currentView = null;
    this.updateHeader('随机组题', false);
    
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector('.nav-item[data-nav="random"]')?.classList.add('active');
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    
    const wrong = this.data.wrongQuestions;
    
    let html = `<div class="fade-in">
      <div class="card">
        <div class="card-title" style="margin-bottom:16px;">随机组题设置</div>
        <div class="random-config">
          <div class="config-row">
            <span class="config-label">抽取数量</span>
            <input type="number" class="config-input" id="rnd-count" value="10" min="1" max="${wrong.length}" style="width:80px;">
          </div>
          <div class="config-row">
            <span class="config-label">科目范围</span>
            <select class="config-input" id="rnd-subject" style="width:120px;">
              <option value="all">两科混合</option>
              <option value="经济基础知识">仅经济基础</option>
              <option value="人力资源管理专业知识和实务">仅人力资源</option>
            </select>
          </div>
          <div class="config-row">
            <span class="config-label">阶段范围</span>
            <select class="config-input" id="rnd-stage" style="width:120px;">
              <option value="all">全阶段</option>
              <option value="stage1">仅第一阶段</option>
              <option value="stage2">仅第二阶段</option>
              <option value="stage3">仅第三阶段</option>
            </select>
          </div>
        </div>
        <div style="margin-top:12px;text-align:center;">
          <div style="font-size:var(--font-size-sm);color:var(--text-muted);margin-bottom:8px;">可选错题池: ${wrong.length} 题</div>
          <button class="btn btn-primary" onclick="App.generateRandomQuiz()">生成练习卷</button>
        </div>
      </div>
      <div id="random-quiz-area"></div>
    </div>`;
    this.setHTML(html);
  },

  generateRandomQuiz() {
    const count = parseInt(document.getElementById('rnd-count').value) || 10;
    const subject = document.getElementById('rnd-subject').value;
    const stage = document.getElementById('rnd-stage').value;
    
    let pool = [...this.data.wrongQuestions];
    if (subject !== 'all') pool = pool.filter(w => w.subject === subject);
    if (stage !== 'all') pool = pool.filter(w => w.stage === stage);
    
    if (pool.length === 0) {
      this.toast('没有符合条件的错题');
      return;
    }
    
    const selected = [];
    const used = new Set();
    const actualCount = Math.min(count, pool.length);
    
    while (selected.length < actualCount) {
      const idx = Math.floor(Math.random() * pool.length);
      if (!used.has(idx)) {
        used.add(idx);
        selected.push(pool[idx]);
      }
    }
    
    this.currentView = { type: 'random', questions: selected };
    
    let html = `<div class="fade-in quiz-container" style="margin-top:12px;">`;
    html += `<div class="paper-header"><div class="paper-title">随机练习卷</div><div class="paper-meta">共 ${selected.length} 题</div></div>`;
    
    selected.forEach((q, qi) => {
      html += `<div class="quiz-card" id="rnd-card-${qi}">
        <div class="quiz-num">第 ${qi+1}/${selected.length} 题 <span style="color:var(--text-muted);">· 错误${q.errorCount||1}次</span></div>
        <div class="quiz-question">${q.question}</div>`;
      
      q.options.forEach((opt, oi) => {
        html += `<button class="quiz-option" onclick="App.answerRandom(${qi},${oi})" id="rnd-opt-${qi}-${oi}">${opt}</button>`;
      });
      
      html += `<div id="rnd-result-${qi}"></div></div>`;
    });
    
    html += `<div style="text-align:center;padding:12px;">
      <button class="btn btn-success" onclick="App.showRandomResult()">提交查看结果</button>
    </div></div>`;
    
    document.getElementById('random-quiz-area').innerHTML = html;
    
    // Scroll to first question
    setTimeout(() => {
      document.getElementById('rnd-card-0')?.scrollIntoView({behavior:'smooth',block:'center'});
    }, 100);
  },

  answerRandom(qi, oi) {
    const card = document.getElementById(`rnd-card-${qi}`);
    const opts = card.querySelectorAll('.quiz-option');
    opts.forEach(o => o.classList.remove('selected'));
    document.getElementById(`rnd-opt-${qi}-${oi}`).classList.add('selected');
    
    if (!this._randomAnswers) this._randomAnswers = {};
    this._randomAnswers[qi] = oi;
  },

  showRandomResult() {
    if (!this._randomAnswers || !this.currentView?.questions) {
      this.toast('请先完成所有题目');
      return;
    }
    
    const questions = this.currentView.questions;
    let correct = 0, wrong = 0;
    const results = [];
    
    questions.forEach((q, qi) => {
      const ua = this._randomAnswers[qi];
      const card = document.getElementById(`rnd-card-${qi}`);
      const opts = card.querySelectorAll('.quiz-option');
      
      if (ua === undefined) return;
      
      opts.forEach(o => o.disabled = true);
      
      if (ua === q.answer) {
        correct++;
        document.getElementById(`rnd-opt-${qi}-${ua}`).classList.add('correct');
      } else {
        wrong++;
        document.getElementById(`rnd-opt-${qi}-${ua}`).classList.add('wrong');
        document.getElementById(`rnd-opt-${qi}-${q.answer}`).classList.add('correct');
        q.errorCount = (q.errorCount || 1) + 1;
      }
      
      const resultDiv = document.getElementById(`rnd-result-${qi}`);
      const mnemonics = this.data.mnemonics.filter(m => m.subject === q.subject && m.chapter === q.chapter);
      const formulas = this.data.formulas.filter(f => f.subject === q.subject && f.chapter === q.chapter);
      
      let rHtml = `<div class="quiz-answer">
        <span class="${ua===q.answer?'correct-text':'wrong-text'}">${ua===q.answer?'✓ 正确':'✗ 错误'}</span>
        <div style="margin-top:6px;"><strong>解析：</strong>${q.analysis}</div>`;
      
      if (mnemonics.length > 0) {
        rHtml += `<div style="margin-top:4px;"><strong>💡 口诀：</strong>${mnemonics.map(m=>m.content).join('；')}</div>`;
      }
      if (formulas.length > 0) {
        rHtml += `<div style="margin-top:4px;"><strong>📐 公式：</strong>${formulas.map(f=>f.content).join('；')}</div>`;
      }
      rHtml += `</div>`;
      resultDiv.innerHTML = rHtml;
      
      // Update wrong question data
      const existing = this.data.wrongQuestions.find(w => w.id === q.id);
      if (existing) {
        existing.errorCount = q.errorCount;
      }
    });
    
    DataStore.save(this.data);
    this._randomAnswers = {};
    
    const total = correct + wrong;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    
    // Show summary at top
    const summaryHtml = `<div class="card" style="text-align:center;">
      <div class="score-circle"><div class="score-num">${score}</div><div class="score-label">分</div></div>
      <div class="result-summary">
        <div class="result-item"><div class="result-value r-total">${total}</div><div>总题数</div></div>
        <div class="result-item"><div class="result-value r-correct">${correct}</div><div>正确</div></div>
        <div class="result-item"><div class="result-value r-wrong">${wrong}</div><div>错误</div></div>
      </div>
    </div>`;
    
    const area = document.getElementById('random-quiz-area');
    area.insertAdjacentHTML('afterbegin', summaryHtml);
    
    this.toast(`得分: ${score}分 (${correct}/${total})`);
    
    // Scroll to top
    area.scrollIntoView({behavior:'smooth',block:'start'});
  },

  // ==================== 记忆口诀 + 公式库 ====================
  renderFormulaLibrary() {
    this.currentNav = 'formula';
    this.currentView = null;
    this.updateHeader('口诀与公式库', false);
    
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector('.nav-item[data-nav="formula"]')?.classList.add('active');
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    
    const d = this.data;
    let type = 'all';
    
    let html = `<div class="fade-in">
      <div class="subject-tabs">
        <div class="subject-tab ${this.currentSubject==='经济基础知识'?'active':''}" 
             onclick="App.setSubject('经济基础知识');App.renderFormulaLibrary()">经济基础</div>
        <div class="subject-tab ${this.currentSubject==='人力资源管理专业知识和实务'?'active':''}" 
             onclick="App.setSubject('人力资源管理专业知识和实务');App.renderFormulaLibrary()">人力资源</div>
      </div>
      <div class="search-bar">
        <span>&#x1F50D;</span>
        <input type="text" placeholder="搜索口诀、公式、知识点..." 
               oninput="App.searchFormula(this.value)" id="formula-search">
      </div>
      <div class="filter-chips">
        <span class="filter-chip active" onclick="App.filterFormula('all',this)">全部</span>
        <span class="filter-chip" onclick="App.filterFormula('mnemonic',this)">口诀</span>
        <span class="filter-chip" onclick="App.filterFormula('formula',this)">公式</span>
      </div>
      <div id="formula-list"></div>
    </div>`;
    
    this.setHTML(html);
    this.renderFormulaList(d.mnemonics.concat(d.formulas));
  },

  renderFormulaList(items) {
    const subject = this.currentSubject;
    const filtered = items.filter(item => {
      if (item.subject) return item.subject === subject;
      return true;
    });
    
    if (filtered.length === 0) {
      document.getElementById('formula-list').innerHTML = 
        `<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-text">暂无数据</div></div>`;
      return;
    }
    
    // Group by chapter
    const grouped = {};
    filtered.forEach(item => {
      const ch = item.chapter || '其他';
      if (!grouped[ch]) grouped[ch] = [];
      grouped[ch].push(item);
    });
    
    let html = '';
    for (const [ch, items] of Object.entries(grouped)) {
      html += `<div style="font-size:var(--font-size-sm);color:var(--text-muted);margin:12px 0 6px;font-weight:600;">${ch}</div>`;
      items.forEach(item => {
        const isFormula = item.type === 'formula';
        html += `<div class="formula-card ${isFormula?'':'mnemonic'}">
          <div>
            <span class="formula-tag ${isFormula?'formula':'mnemonic'}">${isFormula?'公式':'口诀'}</span>
            <span style="font-size:var(--font-size-xs);color:var(--text-muted);margin-left:6px;">${item.knowledge||''}</span>
          </div>
          <div class="formula-text" style="white-space:pre-line;">${item.content}</div>
        </div>`;
      });
    }
    
    document.getElementById('formula-list').innerHTML = html;
  },

  searchFormula(query) {
    if (!query.trim()) {
      this.renderFormulaList(this.data.mnemonics.concat(this.data.formulas));
      return;
    }
    
    const all = this.data.mnemonics.concat(this.data.formulas);
    const filtered = all.filter(item => {
      return (item.content && item.content.includes(query)) ||
             (item.knowledge && item.knowledge.includes(query)) ||
             (item.chapter && item.chapter.includes(query));
    });
    this.renderFormulaList(filtered);
  },

  filterFormula(type, el) {
    document.querySelectorAll('#formula-list').forEach(() => {});
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    if (el) el.classList.add('active');
    
    const searchInput = document.getElementById('formula-search');
    const query = searchInput?.value || '';
    
    let items;
    if (type === 'all') {
      items = this.data.mnemonics.concat(this.data.formulas);
    } else if (type === 'mnemonic') {
      items = this.data.mnemonics;
    } else {
      items = this.data.formulas;
    }
    
    if (query.trim()) {
      items = items.filter(item => {
        return (item.content && item.content.includes(query)) ||
               (item.knowledge && item.knowledge.includes(query)) ||
               (item.chapter && item.chapter.includes(query));
      });
    }
    
    this.renderFormulaList(items);
  },

  // ==================== 每日打卡 ====================
  renderCheckin() {
    this.currentNav = 'checkin';
    this.currentView = null;
    this.updateHeader('每日打卡', false);
    
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector('.nav-item[data-nav="checkin"]')?.classList.add('active');
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    
    const d = this.data;
    const today = this.getDateStr();
    const isCheckedToday = d.checkin.history[today] || false;
    const streak = d.checkin.streak || 0;
    const lastDate = d.checkin.lastCheckinDate;
    const yesterday = this.getDateStr(new Date(Date.now() - 86400000));
    
    // Calculate if streak should continue
    let displayStreak = streak;
    if (!isCheckedToday && lastDate !== yesterday) {
      displayStreak = 0;
    }
    
    // Calculate stage completion
    const stats = this.computeStats();
    const daysLeft = this.daysUntilExam();
    const todayDate = new Date();
    const stage2Start = new Date(2026, 8, 1); // Sept 1
    const stage3Start = new Date(2026, 9, 1); // Oct 1
    
    let currentStage, stageProgress, dailyGoal;
    if (todayDate < stage2Start) {
      currentStage = '第一阶段：考点学习';
      stageProgress = stats.ecoStats.pointProgress;
      dailyGoal = '建议每天学习2-3个考点';
    } else if (todayDate < stage3Start) {
      currentStage = '第二阶段：母题练习';
      stageProgress = (stats.ecoStats.mqProgress + stats.hrStats.mqProgress) / 2;
      dailyGoal = '建议每天完成10-15道母题';
    } else {
      currentStage = '第三阶段：真题冲刺';
      stageProgress = (stats.ecoStats.examProgress + stats.hrStats.examProgress) / 2;
      dailyGoal = '建议每天完成1套真题';
    }
    
    // Generate calendar for current month
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    let html = `<div class="fade-in">
      <div class="checkin-card">
        <div class="checkin-streak">${displayStreak}</div>
        <div class="checkin-streak-label">连续打卡天数</div>
        <button class="checkin-btn" ${isCheckedToday?'disabled':''} 
                onclick="App.doCheckin()">${isCheckedToday?'今日已打卡 ✓':'立即打卡'}</button>
        <div style="margin-top:16px;font-size:var(--font-size-sm);text-align:center;opacity:0.9;">
          当前阶段：${currentStage}<br>完成进度：${Math.round(stageProgress)}%<br>${dailyGoal}
        </div>
      </div>
      
      <div class="card">
        <div class="card-title" style="margin-bottom:12px;">${year}年${month+1}月打卡记录</div>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center;font-size:var(--font-size-xs);color:var(--text-muted);margin-bottom:4px;">
          <span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span>
        </div>
        <div class="checkin-grid">`;
    
    for (let i = 0; i < firstDay; i++) {
      html += `<div></div>`;
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const checked = d.checkin.history[dateStr];
      const isToday = d === now.getDate();
      html += `<div class="checkin-day ${checked?'done':''}" style="${isToday?'border:2px solid var(--primary);':''}">${d}</div>`;
    }
    
    html += `</div></div>`;
    
    // Stage plan
    html += `<div class="card">
      <div class="card-title" style="margin-bottom:12px;">备考阶段规划</div>
      <div style="padding:8px 0;border-left:2px solid var(--stage1-color);padding-left:12px;margin-bottom:12px;">
        <div style="font-weight:600;">第一阶段 (8月) - 考点学习</div>
        <div style="font-size:var(--font-size-sm);color:var(--text-muted);">目标：完成两个科目全部章节考点学习，标记掌握状态</div>
        <div class="progress-bar" style="margin-top:8px;"><div class="progress-fill stage1" style="width:${stats.ecoStats.pointProgress}%"></div></div>
      </div>
      <div style="padding:8px 0;border-left:2px solid var(--stage2-color);padding-left:12px;margin-bottom:12px;">
        <div style="font-weight:600;">第二阶段 (9月) - 母题练习</div>
        <div style="font-size:var(--font-size-sm);color:var(--text-muted);">目标：完成两个科目全部章节母题练习，错题回顾</div>
        <div class="progress-bar" style="margin-top:8px;"><div class="progress-fill stage2" style="width:${stats.ecoStats.mqProgress}%"></div></div>
      </div>
      <div style="padding:8px 0;border-left:2px solid var(--stage3-color);padding-left:12px;margin-bottom:12px;">
        <div style="font-weight:600;">第三阶段 (10月) - 真题冲刺</div>
        <div style="font-size:var(--font-size-sm);color:var(--text-muted);">目标：完成近3-5年真题练习，查漏补缺</div>
        <div class="progress-bar" style="margin-top:8px;"><div class="progress-fill stage3" style="width:${stats.ecoStats.examProgress}%"></div></div>
      </div>
      <div style="text-align:center;font-size:var(--font-size-sm);color:var(--text-muted);">距11月7日考试还有 ${daysLeft} 天</div>
    </div>
    </div>`;
    
    this.setHTML(html);
  },

  doCheckin() {
    const today = this.getDateStr();
    const d = this.data;
    d.checkin.history[today] = true;
    
    const yesterday = this.getDateStr(new Date(Date.now() - 86400000));
    if (d.checkin.lastCheckinDate === yesterday) {
      d.checkin.streak = (d.checkin.streak || 0) + 1;
    } else if (d.checkin.lastCheckinDate === today) {
      // Already checked in today
    } else {
      d.checkin.streak = 1;
    }
    d.checkin.lastCheckinDate = today;
    DataStore.save(d);
    
    this.toast(`打卡成功！连续 ${d.checkin.streak} 天`);
    this.renderCheckin();
  },

  getDateStr(date) {
    const d = date || new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  },

  // ==================== 我的/设置 ====================
  renderMe() {
    this.currentNav = 'me';
    this.currentView = null;
    this.updateHeader('个人中心', false);
    
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector('.nav-item[data-nav="me"]')?.classList.add('active');
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    
    const d = this.data;
    const stats = this.computeStats();
    
    let html = `<div class="fade-in">
      <div class="card" style="text-align:center;">
        <div style="font-size:48px;margin-bottom:8px;">👤</div>
        <div style="font-size:var(--font-size-lg);font-weight:600;">备考人</div>
        <div style="font-size:var(--font-size-sm);color:var(--text-muted);">中级经济师 · 距考试${this.daysUntilExam()}天</div>
      </div>
      
      <div class="card">
        <div class="card-title" style="margin-bottom:12px;">学习统计</div>
        <div class="stats-grid">
          <div class="stat-item"><div class="stat-value">${stats.masteredPoints}</div><div class="stat-label">已掌握考点</div></div>
          <div class="stat-item"><div class="stat-value">${stats.mqDone}</div><div class="stat-label">已完成母题</div></div>
          <div class="stat-item"><div class="stat-value">${stats.examDone}</div><div class="stat-label">已完成真题</div></div>
          <div class="stat-item"><div class="stat-value danger">${stats.totalWrong}</div><div class="stat-label">错题数</div></div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-title" style="margin-bottom:12px;">设置</div>
        <div class="settings-item">
          <span class="settings-label">深色模式</span>
          <div class="switch ${d.settings.darkMode?'on':''}" onclick="App.toggleDarkMode()"></div>
        </div>
        <div class="settings-item">
          <span class="settings-label">导出学习数据</span>
          <button class="btn btn-outline btn-sm" onclick="App.exportData()">导出</button>
        </div>
        <div class="settings-item">
          <span class="settings-label">导入学习数据</span>
          <button class="btn btn-outline btn-sm" onclick="App.importData()">导入</button>
        </div>
        <div class="settings-item">
          <span class="settings-label">批量导入</span>
          <button class="btn btn-outline btn-sm" onclick="App.showBulkImport()">批量导入</button>
        </div>
        <div class="settings-item">
          <span class="settings-label">重置全部数据</span>
          <button class="btn btn-danger btn-sm" onclick="App.resetAllData()">重置</button>
        </div>
      </div>
      
      <div style="text-align:center;padding:16px;color:var(--text-muted);font-size:var(--font-size-xs);">
        中级经济师备考工作台 v1.0<br>
        覆盖《经济基础知识》+《人力资源管理专业知识和实务》
      </div>
    </div>`;
    
    this.setHTML(html);
  },

  toggleDarkMode() {
    this.data.settings.darkMode = !this.data.settings.darkMode;
    if (this.data.settings.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    DataStore.save(this.data);
    this.renderMe();
  },

  exportData() {
    DataStore.exportData();
    this.toast('数据已导出');
  },

  importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (DataStore.importData(ev.target.result)) {
          this.data = DataStore.load();
          this.toast('数据导入成功');
          this.renderHome();
        } else {
          this.toast('数据格式错误');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  },

  showBulkImport() {
    let html = `<div class="detail-overlay" onclick="if(event.target===this)App.closeDetail()">
      <div class="detail-sheet">
        <div class="detail-handle"></div>
        <div class="detail-title">批量导入</div>
        <p style="font-size:var(--font-size-sm);color:var(--text-muted);margin-bottom:12px;">
          支持导入JSON格式的数据文件，格式请参考模板。可分别导入考点、母题、真题、口诀、公式。
        </p>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <button class="btn btn-outline btn-block" onclick="App.bulkImportTrigger('points')">导入考点数据 (第一阶段)</button>
          <button class="btn btn-outline btn-block" onclick="App.bulkImportTrigger('motherQuestions')">导入母题数据 (第二阶段)</button>
          <button class="btn btn-outline btn-block" onclick="App.bulkImportTrigger('examPapers')">导入真题数据 (第三阶段)</button>
          <button class="btn btn-outline btn-block" onclick="App.bulkImportTrigger('mnemonics')">导入记忆口诀</button>
          <button class="btn btn-outline btn-block" onclick="App.bulkImportTrigger('formulas')">导入公式</button>
        </div>
        <button class="detail-close" onclick="App.closeDetail()">关闭</button>
      </div>
    </div>`;
    
    document.getElementById('modalOverlay').style.display = 'block';
    document.getElementById('modalContent').style.display = 'block';
    document.getElementById('modalContent').innerHTML = html;
    document.getElementById('modalOverlay').onclick = () => this.closeDetail();
  },

  bulkImportTrigger(type) {
    this.closeDetail();
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          const typeMap = {
            'points': '考点', 'motherQuestions': '母题',
            'examPapers': '真题', 'mnemonics': '口诀', 'formulas': '公式'
          };
          
          if (type === 'points') {
            const subject = this.currentSubject;
            DataStore.importBulk(type, subject, data);
          } else if (type === 'motherQuestions') {
            const subject = this.currentSubject;
            DataStore.importBulk(type, subject, data);
          } else if (type === 'examPapers') {
            const subject = this.currentSubject;
            DataStore.importBulk(type, subject, data);
          } else if (type === 'mnemonics' || type === 'formulas') {
            DataStore.importBulk(type, null, data);
          }
          
          this.data = DataStore.load();
          this.toast(`${typeMap[type]}导入成功`);
          this.renderHome();
        } catch(err) {
          this.toast('导入失败，请检查JSON格式');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  },

  resetAllData() {
    if (confirm('确定要重置全部学习数据吗？所有进度、错题、打卡记录将被清除。此操作不可恢复！')) {
      this.data = DataStore.reset();
      this.toast('数据已重置');
      this.renderHome();
    }
  },

  showSettings() {
    this.renderMe();
  },

  showQuizDetail(category, subject, chId, qId) {
    // Find the question and show detail
    let question = null, chName = '';
    
    if (category === 'mq') {
      for (const ch of (this.data.motherQuestions[subject]?.chapters || [])) {
        if (ch.id === chId) {
          question = ch.questions.find(q => q.id === qId);
          chName = ch.name;
          break;
        }
      }
    }
    
    if (!question) return;
    
    const answers = JSON.parse(localStorage.getItem('mq_answers') || '{}');
    const userAns = answers[qId];
    
    const mnemonics = this.data.mnemonics.filter(m => m.subject === subject && m.chapter === chName);
    const formulas = this.data.formulas.filter(f => f.subject === subject && f.chapter === chName);
    
    let html = `<div class="detail-overlay" onclick="if(event.target===this)App.closeDetail()">
      <div class="detail-sheet">
        <div class="detail-handle"></div>
        <div class="detail-title">题目详情</div>
        <div class="detail-content">${question.question}</div>`;
    
    question.options.forEach((opt, oi) => {
      let style = '';
      if (userAns !== undefined) {
        if (oi === question.answer) style = 'color:var(--success);font-weight:600;';
        else if (oi === userAns) style = 'color:var(--danger);font-weight:600;';
      }
      html += `<div style="padding:6px 0;${style}">${opt}${oi===question.answer?' ✓':''}</div>`;
    });
    
    html += `<div class="detail-section"><div class="detail-section-content"><strong>解析：</strong>${question.analysis}</div></div>`;
    
    if (mnemonics.length > 0) {
      html += `<div class="detail-section"><div class="detail-section-title">💡 相关口诀</div>`;
      mnemonics.forEach(m => {
        html += `<div class="detail-section-content" style="white-space:pre-line;">${m.content}</div>`;
      });
      html += `</div>`;
    }
    if (formulas.length > 0) {
      html += `<div class="detail-section"><div class="detail-section-title">📐 相关公式</div>`;
      formulas.forEach(f => {
        html += `<div class="detail-section-content" style="white-space:pre-line;">${f.content}</div>`;
      });
      html += `</div>`;
    }
    
    html += `<button class="detail-close" onclick="App.closeDetail()">关闭</button></div></div>`;
    
    document.getElementById('modalOverlay').style.display = 'block';
    document.getElementById('modalContent').style.display = 'block';
    document.getElementById('modalContent').innerHTML = html;
    document.getElementById('modalOverlay').onclick = () => this.closeDetail();
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
