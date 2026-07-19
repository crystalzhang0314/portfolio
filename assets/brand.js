const requestedLogo = new URLSearchParams(location.search).get("logo") || "bauhaus";
const supportedLogos = new Set(["wordmark", "bauhaus"]);

const bauhausMark = `<svg viewBox="0 0 48 48" role="img" aria-label="Crystal CZ 包豪斯标志">
  <defs>
    <linearGradient id="cz-bauhaus-gradient" x1="6" y1="7" x2="42" y2="41" gradientUnits="userSpaceOnUse">
      <stop stop-color="#a8f57a"/>
      <stop offset=".52" stop-color="#4dd4ac"/>
      <stop offset="1" stop-color="#4a90d4"/>
    </linearGradient>
  </defs>
  <path d="M25 8.2a16 16 0 1 0 0 31.6v-7.1a8.9 8.9 0 1 1 0-17.4V8.2Z" fill="url(#cz-bauhaus-gradient)"/>
  <path d="M27.4 8.2h14.1L31.9 25h9.6v6.7H20.2L29.8 15h-2.4V8.2Z" fill="currentColor"/>
  <circle class="crystal-logo__accent" cx="38.7" cy="38.3" r="3.1" fill="#a8f57a"/>
</svg>`;

function applySelectedLogo() {
  if (!supportedLogos.has(requestedLogo)) return true;
  const logo = document.querySelector(".navbar__logo");
  const mark = document.querySelector(".navbar__logo-mark");
  const wordmark = document.querySelector(".navbar__logo-text");
  if (!logo || !mark || !wordmark) return false;

  logo.dataset.logoStyle = requestedLogo;

  if (requestedLogo === "wordmark") {
    mark.hidden = true;
    wordmark.innerHTML = `<span class="crystal-wordmark__c">C</span><span>rystal</span>`;
    wordmark.setAttribute("aria-label", "Crystal");
  } else {
    mark.hidden = false;
    mark.innerHTML = bauhausMark;
    mark.dataset.crystalVariant = "bauhaus";
    wordmark.textContent = "Crystal";
  }
  return true;
}

function applyHeroContentChanges() {
  const metaLabels = [...document.querySelectorAll(".hero__meta-label")];
  const experienceLabel = metaLabels.find((item) => item.textContent.trim() === "经历");
  if (experienceLabel) experienceLabel.textContent = "主要经历";

  const metaValues = [...document.querySelectorAll(".hero__meta-value")];
  const qingCloudValue = metaValues.find((item) => item.textContent.includes("青云 QingCloud"));
  if (qingCloudValue) qingCloudValue.textContent = "青云 QingCloud";

  const actions = document.querySelector(".hero__actions");
  if (actions) actions.remove();

  const mobileContactButton = document.querySelector(".mobile-menu__cta");
  if (mobileContactButton) mobileContactButton.remove();

  const scroll = document.querySelector(".hero__scroll");
  if (scroll) scroll.remove();

  const aboutIntro = document.querySelector("#about .about__intro-text");
  if (aboutIntro) aboutIntro.textContent = aboutIntro.textContent.replace("资深产品设计师", "产品设计师");

  return Boolean(experienceLabel && qingCloudValue);
}

function restoreHeroTypingAfterIntro() {
  if (location.pathname !== "/") return true;
  const typing = document.querySelector(".hero__title-typing");
  const content = typing?.querySelector(".text-type__content");
  if (!typing || !content) return false;

  // The React typing animation starts while the full-screen intro is still
  // covering the page. Replay only in that case so regular in-page navigation
  // keeps the original animation and does not type twice.
  if (!document.documentElement.classList.contains("is-intro-playing")) return true;
  if (typing.dataset.introRetype) return true;
  typing.dataset.introRetype = "pending";

  const target = "Crystal Zhang";
  const waitForIntroExit = () => {
    if (!typing.isConnected) return;
    const introVisible = document.getElementById("crystal-intro")
      || document.documentElement.classList.contains("is-intro-playing");
    if (introVisible) {
      requestAnimationFrame(waitForIntroExit);
      return;
    }

    content.textContent = "";
    typing.dataset.introRetype = "running";
    let index = 0;
    const typeNext = () => {
      if (!content.isConnected) return;
      index += 1;
      content.textContent = target.slice(0, index);
      if (index < target.length) {
        window.setTimeout(typeNext, 42);
      } else {
        typing.dataset.introRetype = "complete";
      }
    };
    window.setTimeout(typeNext, 120);
  };

  requestAnimationFrame(waitForIntroExit);
  return true;
}

const sectionHeadlines = [
  {
    selector: "#about .section-title",
    lead: "在技术、产品与用户之间，",
    focus: "建立清晰而有价值的连接。"
  },
  {
    selector: "#work .section-title",
    lead: "深入复杂业务，",
    focus: "端到端设计企业级云产品。"
  },
  {
    selector: "#capabilities .section-title",
    lead: "不止于界面设计，",
    focus: "更是理解业务的产品伙伴。"
  },
  {
    selector: "#contact .contact__headline",
    lead: "一起创造",
    focus: "更有价值的云产品体验。",
    contact: true
  }
];

function applyHeadlineLayout() {
  let complete = true;
  sectionHeadlines.forEach(({ selector, lead, focus, contact }) => {
    const heading = document.querySelector(selector);
    if (!heading) {
      complete = false;
      return;
    }
    if (heading.dataset.splitHeadline === "complete") return;
    const prefix = contact ? "contact-headline" : "section-title";
    heading.innerHTML = `<span class="${prefix}__lead">${lead}</span><span class="${prefix}__focus">${focus}</span>`;
    heading.dataset.splitHeadline = "complete";
  });
  return complete;
}

function applyCapabilityChanges() {
  const grid = document.querySelector("#capabilities .capabilities__grid");
  if (!grid) return false;

  const subtitle = document.querySelector("#capabilities .capabilities__subtitle");
  if (subtitle) {
    subtitle.textContent = "多年的云计算领域实践，让我的能力自然延伸至设计、研究与产品协作，也让我能够从更完整的视角推动复杂问题落地。";
  }

  if (grid.dataset.capabilitiesTrimmed === "complete") return true;

  const removedTitles = new Set(["产品设计", "产品策略", "云计算领域经验"]);
  [...grid.querySelectorAll(".cap-card")].forEach((card) => {
    const title = card.querySelector("h3")?.textContent.trim();
    if (removedTitles.has(title)) card.remove();
  });

  const capabilityRoutes = {
    "用户研究": "user-research",
    "跨职能协作": "cross-functional",
    "产品运营": "product-operations",
    "设计运营": "product-operations"
  };
  [...grid.querySelectorAll(".cap-card")].forEach((card) => {
    const titleNode = card.querySelector("h3");
    if (titleNode?.textContent.trim() === "设计运营") {
      titleNode.textContent = "产品运营";
      const description = card.querySelector(".cap-card__desc");
      if (description) description.textContent = "围绕企业级产品建立内容、渠道、活动与 GEO 协同的运营体系，让专业价值被持续理解和触达。";
      const skills = card.querySelector(".cap-card__skills");
      if (skills) skills.innerHTML = "<span class=\"cap-card__skill\">Content Strategy</span><span class=\"cap-card__skill\">GEO</span><span class=\"cap-card__skill\">Channel Operations</span><span class=\"cap-card__skill\">Campaigns</span>";
    }
    const title = titleNode?.textContent.trim();
    if (title === "产品运营") {
      const icon = card.querySelector(".cap-card__icon");
      if (icon) {
        icon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 10.5V14.5C4 15.33 4.67 16 5.5 16H8L10 20H13L11.5 16H13L19 19V6L13 9H5.5C4.67 9 4 9.67 4 10.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M19 9L21.5 7M19.5 12.5H22M19 16L21.5 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>`;
      }
    }
    const slug = capabilityRoutes[title];
    if (!slug) return;
    card.setAttribute("role", "link");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `查看${title}能力详情`);
    card.dataset.capabilityRoute = slug;
    const openDetail = () => { location.href = `/project/capability-${slug}`; };
    card.addEventListener("click", openDetail);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openDetail();
      }
    });
  });

  [...grid.querySelectorAll(".cap-card")].forEach((card, index) => {
    const number = card.querySelector(".cap-card__index");
    if (number) number.textContent = String(index + 1).padStart(2, "0");
  });
  grid.dataset.capabilitiesTrimmed = "complete";
  return true;
}

const capabilityDetails = {
  "user-research": {
    title: "用户研究",
    eyebrow: "USER RESEARCH",
    intro: "通过企业用户访谈、可用性测试与工作流分析，让设计判断建立在真实使用场景之上。",
    themes: ["研究目标", "研究方法", "关键发现", "设计转化"]
  },
  "cross-functional": {
    title: "跨职能协作",
    eyebrow: "CROSS-FUNCTIONAL COLLABORATION",
    intro: "通过 DPE 协作机制连接交付现场、QA、产品与研发，把一线问题转化为可追踪的产品输入和可复用的交付能力。",
    themes: ["协作背景", "共同目标", "决策过程", "交付与复盘"]
  },
  "product-operations": {
    title: "产品运营",
    eyebrow: "PRODUCT OPERATIONS",
    intro: "围绕企业级私有云产品建立内容、渠道、活动与 GEO 协同的运营体系，将专业能力转化为可理解、可触达、可持续沉淀的品牌资产。",
    themes: ["目标与定位", "内容策略", "渠道矩阵", "复盘与迭代"]
  }
};

function detailSeriesFooterMarkup(href, eyebrow, label) {
  return `<footer class="detail-series-footer">
    <button class="detail-series-footer__top" type="button">回到顶部</button>
    <a class="detail-series-footer__next" href="${href}">
      <span>${eyebrow}</span><strong>${label}</strong><i aria-hidden="true">→</i>
    </a>
  </footer>`;
}

const capabilityStories = {
  "user-research": {
    conclusion: "把验收测试从功能核对升级为真实场景验证，让产品在发布前回答“用户能否完成目标、产品是否真正交付价值”。",
    metrics: [
      ["9", "真实用户 / 人次", "覆盖代理商与典型交付角色"],
      ["49", "识别问题", "从真实环境、流程和文档中暴露风险"],
      ["11", "发布前修复 Bug", "提前降低安装和交付试错成本"]
    ],
    chapters: [
      {
        index: "02", label: "研究框架", title: "从功能清单转向用户价值",
        copy: "我参与建立 UAT 2.0 方法：先明确目标用户、业务动机和成功标准，再把跨产品的真实任务组织成可执行场景。研究不止验证“能不能用”，还要判断使用路径是否符合用户心智、结果是否满足业务目标。",
        custom: "research-framework", images: [
          ["/assets/detail-media/research/researcher-vs-product-manager.png", "用户研究与产品管理的协作边界", "用职责交集说明研究洞察如何进入产品策略与解决方案。"]
        ]
      },
      {
        index: "03", label: "任务设计", title: "用场景故事连接目标、任务与成功标准",
        copy: "把“创建一台集群”这样的功能任务，改写为包含前置条件、业务目的、关键路径和结果验证的场景故事。任务既保留真实环境的弹性，也能帮助观察者识别阻塞点、错误理解和隐藏需求。",
        custom: "research-scenario", images: [
          ["/assets/detail-media/research/customer-profile-dajia-insurance.png", "客户画像：大家保险集团", "从组织关系、关键角色与使用背景建立研究对象的业务上下文。"],
          ["/assets/detail-media/research/persona-it-operations-engineer.png", "角色画像：IT 运维工程师", "围绕职责、目标、痛点和真实工作场景形成可执行的研究依据。"]
        ]
      },
      {
        index: "04", label: "证据与转化", title: "让研究结论进入产品决策",
        copy: "通过外部代理商在真实交换机和部署环境中执行任务，记录任务成功水平、问题影响度与责任归属。结论被整理为可追踪的问题清单，推动产品、安装器、文档和支持流程同步优化。",
        custom: "research-evidence", images: [
          ["/assets/detail-media/research/journey-resource-delivery.png", "资源交付场景体验地图", "把目标、行为、触点、情绪与机会点连接起来，支持问题定位和方案优先级判断。"]
        ]
      }
    ]
  },
  "cross-functional": {
    conclusion: "用 DPE 协作流把交付现场的一线问题转化为产研可理解、可分工、可闭环的产品输入。",
    metrics: [
      ["14", "核心项目", "深度参与实施与交付协作"],
      ["12", "典型问题", "系统收集且 100% 被产研接纳"],
      ["<small class=\"metric-prefix\">≥</small>50%", "响应提速", "缩短一线问题进入产研的等待时间"],
      ["90%", "经验标准化", "沉淀为实施故障解答范例"]
    ],
    chapters: [
      {
        index: "02", label: "问题定义", title: "先消除信息断层，再讨论解决方案",
        copy: "交付、QA 与 Installer 团队面对的是同一问题的不同切面。通过梳理信息断点、重复沟通与责任模糊，我把典型问题统一为包含场景、影响、复现条件、临时方案和期望结果的输入结构。",
        images: [["/assets/detail-media/collaboration/problem-status.png", "协作问题现状", "从测试环境与真实交付环境的差异中识别风险漏检的根因。"]]
      },
      {
        index: "03", label: "协作机制", title: "建立可追踪的跨团队工作流",
        copy: "用统一入口承接一线问题，明确交付侧补充现场证据、QA 判断质量风险、产品与研发确认方案、知识库沉淀标准答案。每个环节都具备负责人、进入条件和完成定义。",
        images: [
          ["/assets/detail-media/collaboration/process-overview.png", "跨团队协作流概况", "让问题从需求分析、协助规划、方案实施到知识沉淀形成闭环。"],
          ["/assets/detail-media/collaboration/process-roles.png", "协作角色与分工", "明确实施工程师、QA 与 Installer 在关键节点的职责和产出物。"]
        ]
      },
      {
        index: "04", label: "业务价值", title: "把一次解决转化为长期交付能力",
        copy: "工作流不仅提升响应速度，也把现场经验变成产品实施故障解答范例。90% 的典型问题进入标准化资产，让后续项目更快定位、更稳定交付，并持续反哺产品的现场适配性。",
        images: [["/assets/detail-media/collaboration/long-term-value.png", "长期价值沉淀", "将前线问题、协作经验和知识沉淀转化为可持续复用的交付能力。"]]
      }
    ]
  }
};

function researchVisualMarkup(type) {
  if (type === "research-framework") return `
    <div class="research-visual research-framework" role="img" aria-label="UAT 研究框架：从真实用户、场景任务到价值验证">
      <div class="research-framework__axis"><span>真实使用情境</span><i></i><span>产品价值验证</span></div>
      <div class="research-framework__steps">
        <article><small>01 · USER</small><strong>真实用户</strong><p>角色、经验、动机与工作环境</p></article>
        <article><small>02 · SCENARIO</small><strong>场景任务</strong><p>业务目标、关键路径与前置条件</p></article>
        <article><small>03 · VALUE</small><strong>价值验证</strong><p>完成质量、理解成本与成功标准</p></article>
      </div>
    </div>`;
  if (type === "research-scenario") return `
    <div class="research-visual research-scenario" role="img" aria-label="用户角色与场景任务设计">
      <article class="research-persona">
        <div><small>PRIMARY PERSONA</small><strong>企业交付工程师</strong><p>熟悉基础设施，希望用更少试错完成集群部署与验证。</p></div>
        <ul><li><span>目标</span>一次完成部署</li><li><span>环境</span>真实交换机与网络</li><li><span>风险</span>配置错误难定位</li></ul>
      </article>
      <div class="research-journey">
        <header><small>SCENARIO 01</small><strong>为客户交付一套可用的企业云环境</strong></header>
        <ol><li><i>1</i><span><b>确认环境</b><small>检查资源与网络条件</small></span></li><li><i>2</i><span><b>执行部署</b><small>按真实流程完成配置</small></span></li><li><i>3</i><span><b>验证结果</b><small>确认服务与业务目标</small></span></li></ol>
        <footer><span>成功标准</span><strong>独立完成 · 路径清晰 · 结果可验证</strong></footer>
      </div>
    </div>`;
  return `
    <div class="research-visual research-evidence" role="img" aria-label="研究证据如何转化为产品决策">
      <div class="research-evidence__flow"><span>现场观察</span><i></i><span>证据归类</span><i></i><span>优先级判断</span><i></i><span>产品闭环</span></div>
      <div class="research-evidence__content">
        <article class="research-evidence__chart"><small>ISSUE IMPACT</small><div><i style="--bar:88%"></i><span>流程阻塞</span><b>高</b></div><div><i style="--bar:65%"></i><span>理解偏差</span><b>中</b></div><div><i style="--bar:42%"></i><span>体验摩擦</span><b>低</b></div></article>
        <article class="research-evidence__numbers"><small>RESEARCH OUTPUT</small><div><strong>49</strong><span>识别问题</span></div><div><strong>11</strong><span>发布前修复 Bug</span></div><p>按任务完成度与业务影响排序，让结论进入产品、安装器、文档和支持流程。</p></article>
      </div>
    </div>`;
}

const operationsChannelStats = [
  ["知乎", 71, "https://www.zhihu.com/people/49-88-11-91-85/posts"],
  ["搜狐号", 71, "https://www.sohu.com/media/122479548"],
  ["一点号", 70, "https://www.yidianzixun.com/search?word=%E9%9D%92%E4%BA%91%E4%BA%91%E6%98%93%E6%8D%B7"],
  ["CSDN", 69, "https://blog.csdn.net/ProgrammerPulse"],
  ["掘金", 69, "https://juejin.cn/search?query=%E9%9D%92%E4%BA%91%E4%BA%91%E6%98%93%E6%8D%B7"],
  ["InfoQ", 67, "https://www.infoq.cn/search.action?queryString=%E9%9D%92%E4%BA%91%E4%BA%91%E6%98%93%E6%8D%B7"]
];

function productOperationsMarkup() {
  const channels = operationsChannelStats.map(([name, count, url]) => `
    <li><a href="${url}" target="_blank" rel="noopener noreferrer" aria-label="查看${name}渠道文章列表"><span>${name}</span><strong>${count}</strong><small>篇/次发布记录</small></a></li>
  `).join("");
  return `
    <section class="operations-story capability-detail-section" data-progress-label="运营概览">
      <div class="capability-detail-section__heading"><span>01</span><h2>从产品价值到持续触达</h2><p>围绕“轻量、易用的企业级私有云”建立内容与 GEO 协同体系，让专业产品信息更容易被目标用户理解，也更容易被生成式引擎准确引用。</p></div>
      <div class="operations-metrics">
        <article><strong>10+</strong><span>核心关键词</span><p>覆盖超融合、国产化超融合与 VMware 替代等高意图场景。</p></article>
        <article><strong>100%</strong><span>基础可见性</span><p>核心关键词均能抓取到青云云易捷相关信息。</p></article>
        <article><strong>100%</strong><span>推荐场景提及率</span><p>豆包、Kimi 在中小企业国内超融合推荐中均提及产品。</p></article>
      </div>
    </section>
    <section class="operations-story capability-detail-section" data-progress-label="运营方法">
      <div class="capability-detail-section__heading"><span>02</span><h2>从零搭建运营与 GEO 基础</h2><p>先统一产品价值和用户问题，再建立关键词、内容、渠道和验证机制，使内容生产能够持续复用和迭代。</p></div>
      <div class="operations-method-grid">
        <article><span>01</span><h3>价值与用户</h3><p>梳理产品核心优势和目标用户需求，把技术能力翻译成企业 IT 负责人能够判断的场景价值。</p></article>
        <article><span>02</span><h3>关键词矩阵</h3><p>筛选超融合、国产化超融合、VMware 替代等核心词，并用场景词和问题词扩展内容边界。</p></article>
        <article><span>03</span><h3>内容适配</h3><p>建设热词科普、方案对比和使用手册，同时优化事实结构、标题层级与引用上下文，提高生成式平台的抓取概率。</p></article>
        <article><span>04</span><h3>验证与迭代</h3><p>持续在生成式搜索中验证可见性、提及顺序和推荐语境，把结果反向用于内容补强。</p></article>
      </div>
    </section>
    <section class="operations-story capability-detail-section" data-progress-label="GEO 成效">
      <div class="capability-detail-section__heading"><span>03</span><h2>从被检索到被优先推荐</h2><p>首轮适配已验证内容基础与产品定位能够被主流生成式引擎稳定理解，并在关键决策场景中形成明确竞争力。</p></div>
      <div class="operations-thinking operations-thinking--results">
        <article><h3>搜索可见性建立</h3><p>核心关键词基础可见性达到 100%，生成式引擎均能抓取到青云云易捷相关信息。</p></article>
        <article><h3>推荐场景进入前列</h3><p>在“中小企业国内超融合推荐”中，Kimi 将产品列为第一，豆包列为第二。</p></article>
        <article><h3>对比场景获得背书</h3><p>在“超融合与私有云方案对比”回答中，青云云易捷获得豆包特别推荐。</p></article>
      </div>
    </section>
    <section class="operations-story capability-detail-section" data-progress-label="软文矩阵">
      <div class="capability-detail-section__heading"><span>04</span><h2>软文账号与渠道分布</h2><p>通过技术社区、内容平台与行业媒体持续分发，让同一产品价值以适合不同渠道的方式被看见。</p></div>
      <ul class="operations-channel-list">${channels}</ul>
      <div class="operations-topic-note"><strong>内容重点</strong><p>竞品对比 50 篇、超融合技术 27 篇、超融合架构 16 篇，另覆盖国内厂商排名、云原生、AIOps、痛点场景、案例与热点内容。</p></div>
    </section>
    <section class="operations-story capability-detail-section" data-progress-label="思路总结">
      <div class="capability-detail-section__heading"><span>05</span><h2>我的判断与沉淀</h2><p>企业级产品运营的核心，是把专业知识拆成不同用户能够理解、搜索引擎能够准确引用的内容单元，再按渠道和用户意图重新组合。</p></div>
      <div class="operations-thinking">
        <article><h3>先建立可信度，再推动转化</h3><p>技术型 B 端产品决策链长，深度文章、真实案例和客观对比承担信任建设；活动、白皮书和演示预约承担高意向动作。</p></article>
        <article><h3>一份内容，多层表达</h3><p>同一个产品价值可以被组织为公众号深度文、技术社区文章、短视频片段、邮件摘要和 GEO 问答，以降低重复生产成本。</p></article>
        <article><h3>渠道不是简单同步</h3><p>技术社区强调架构与实践，行业媒体强调趋势与背书，自有阵地沉淀产品认知；标题、信息密度和行动入口需要分别适配。</p></article>
      </div>
    </section>
  `;
}

function detailNavMarkup(href, meta) {
  return `<nav class="detail__nav">
    <div class="detail__nav-inner container">
      <a class="detail__nav-back" href="${href}" aria-label="返回对应首页模块">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M10 4L6 8L10 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span>返回</span>
      </a>
      <div class="detail__nav-meta"><span class="detail__nav-role">${meta}</span></div>
    </div>
  </nav>`;
}

function iconPreviewGlyph(type, key) {
  const gradientId = `icon-gradient-${type}-${key}`;
  const softGradientId = `icon-soft-${type}-${key}`;
  const shapes = {
    research: `<path fill="url(#${gradientId})" fill-rule="evenodd" d="M20 7C12.82 7 7 12.82 7 20s5.82 13 13 13c2.62 0 5.06-.78 7.1-2.12L38.6 42.4a2.4 2.4 0 0 0 3.4-3.4L30.48 27.48A12.94 12.94 0 0 0 33 20C33 12.82 27.18 7 20 7Zm0 7a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z"/>`,
    collaboration: `<path fill="url(#${gradientId})" d="M16 8a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm16 3a6 6 0 1 1 0 12 6 6 0 0 1 0-12ZM4 38.5C4 30.49 9.37 25 16 25s12 5.49 12 13.5V41H4v-2.5Zm22.5 2.5v-2.25c0-4.02-1.22-7.54-3.34-10.27A10.62 10.62 0 0 1 32 26c6.08 0 11 4.92 11 11v4H26.5Z"/>`,
    operations: `<path fill="url(#${gradientId})" d="M8 7h25a5 5 0 0 1 5 5v4H13a5 5 0 0 1-5-5V7Zm0 14h32v8H8v-8Zm0 13h18a5 5 0 0 1 5 5v3H13a5 5 0 0 1-5-5v-3Z"/><path fill="url(#${softGradientId})" d="m34 33 10 6-10 6V33Z"/>`,
    email: `<path fill="url(#${gradientId})" d="M7 11h34a4 4 0 0 1 4 4v22a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V15a4 4 0 0 1 4-4Zm0 7.2V35h34V18.2L24 30 7 18.2Z"/>`,
    phone: `<path fill="url(#${gradientId})" d="M12.1 5.2 20 14.7a3.4 3.4 0 0 1 .18 4.08l-3.6 5.12c3.17 5.05 6.35 8.23 11.4 11.4l5.12-3.6a3.4 3.4 0 0 1 4.08.18l9.5 7.9a3.4 3.4 0 0 1 .46 4.76c-2.15 2.62-5.44 3.8-8.72 3.05C18.2 42.96 5.03 29.8.4 9.58-.35 6.3.83 3.01 3.45.86A3.4 3.4 0 0 1 8.2 1.3l3.9 3.9Z" transform="scale(.9) translate(2 1)"/>`,
    location: `<path fill="url(#${gradientId})" fill-rule="evenodd" d="M24 3C13.5 3 5 11.5 5 22c0 13.1 19 24 19 24s19-10.9 19-24C43 11.5 34.5 3 24 3Zm0 11a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z"/>`,
    back: `<path fill="url(#${gradientId})" d="M9 9h30a5 5 0 0 1 5 5v20a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V14a5 5 0 0 1 5-5Zm15.5 8-8 7 8 7v-4h9v-6h-9v-4Z"/>`,
    theme: `<path fill="url(#${gradientId})" d="M25.4 4C15.2 4 7 12.2 7 22.4 7 32.6 15.2 41 25.4 41c8.1 0 15-5.2 17.5-12.5-2.1 1.2-4.5 1.9-7.1 1.9A14.2 14.2 0 0 1 21.6 16.2c0-4.7 2.3-8.9 5.8-11.5-.66-.45-1.3-.7-2-.7Z"/>`,
    menu: `<path fill="url(#${gradientId})" d="M7 10h34a4 4 0 0 1 0 8H7a4 4 0 0 1 0-8Zm0 20h34a4 4 0 0 1 0 8H7a4 4 0 0 1 0-8Z"/>`,
    external: `<path fill="url(#${gradientId})" d="M27 5h16v16h-7v-4.05L20.95 32 16 27.05 31.05 12H27V5ZM8 12h14v7h-9v16h16v-9h7v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V14a2 2 0 0 1 2-2Z"/>`
  };
  return `<svg viewBox="0 0 48 48" role="img" aria-label="${type} 图标方案">
    <defs>
      <linearGradient id="${gradientId}" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse"><stop stop-color="#8BE66B"/><stop offset=".48" stop-color="#3ECDA8"/><stop offset="1" stop-color="#3997E8"/></linearGradient>
      <linearGradient id="${softGradientId}" x1="24" y1="24" x2="46" y2="46" gradientUnits="userSpaceOnUse"><stop stop-color="#78DCC0"/><stop offset="1" stop-color="#6F8FF4"/></linearGradient>
    </defs>${shapes[type]}
  </svg>`;
}

function iconPreviewPanel(theme, label) {
  const icons = [
    ["research", "用户研究", "Research"], ["collaboration", "跨职能协作", "Collaboration"],
    ["operations", "产品运营", "Operations"], ["email", "邮箱", "Email"],
    ["phone", "电话", "Phone"], ["location", "所在地", "Location"],
    ["back", "返回", "Back"], ["theme", "主题切换", "Theme"],
    ["menu", "菜单", "Menu"], ["external", "外部链接", "External link"]
  ];
  return `<section class="icon-preview-theme icon-preview-theme--${theme}" aria-label="${label} 图标效果">
    <header><span>${label}</span><small>${theme === "dark" ? "深色界面" : "浅色界面"}</small></header>
    <div class="icon-preview-grid">${icons.map(([type, title, english], index) => `<article class="icon-preview-card">
      <div class="icon-preview-glyph">${iconPreviewGlyph(type, `${theme}-${index}`)}</div>
      <div><strong>${title}</strong><span>${english}</span></div>
    </article>`).join("")}</div>
  </section>`;
}

function applyIconPreview() {
  if (document.querySelector(".icon-preview[data-icon-preview='complete']")) return true;
  const host = document.querySelector(".detail-404");
  if (!host) return false;
  host.className = "icon-preview";
  host.innerHTML = `${detailNavMarkup("/#capabilities", "ICON SYSTEM · CONCEPT 01")}
    <main class="icon-preview-main container">
      <header class="icon-preview-hero">
        <p>CRYSTAL PORTFOLIO · ICON LANGUAGE</p>
        <h1>面形渐变图标方案</h1>
        <div class="icon-preview-hero__meta"><span>低饱和渐变</span><span>无角标</span><span>统一圆角与视觉重量</span></div>
        <p class="icon-preview-hero__copy">以绿—青—蓝渐变作为统一识别线索，用简洁的实心轮廓表达功能语义。图标不附加圆点、数字或通知式角标，确保界面安静且易于识别。</p>
      </header>
      <div class="icon-preview-themes">${iconPreviewPanel("light", "LIGHT")}${iconPreviewPanel("dark", "DARK")}</div>
      <section class="icon-preview-rules">
        <article><span>01</span><h2>统一骨架</h2><p>48 × 48 基础画布，核心图形保持相近的可见面积和视觉重量。</p></article>
        <article><span>02</span><h2>渐变克制</h2><p>强调色只存在于图形主体，承载容器保持低对比，避免抢夺正文层级。</p></article>
        <article><span>03</span><h2>状态清晰</h2><p>Hover 通过轻微亮度与位移反馈表达，不改变轮廓，也不增加角标。</p></article>
      </section>
    </main>`;
  host.dataset.iconPreview = "complete";
  return true;
}

function applyCapabilityDetailLayout() {
  const match = location.pathname.match(/^\/project\/capability-(.+)$/);
  if (!match) return false;
  const detail = capabilityDetails[match[1]];
  const host = document.querySelector(".detail-404");
  if (!detail || !host) return false;
  if (host.dataset.capabilityDetail === "complete") return true;

  const story = capabilityStories[match[1]];
  const capabilitySlugs = Object.keys(capabilityDetails);
  const capabilityIndex = capabilitySlugs.indexOf(match[1]);
  const nextCapabilitySlug = capabilitySlugs[(capabilityIndex + 1) % capabilitySlugs.length];
  const nextCapability = capabilityDetails[nextCapabilitySlug];
  const storyMarkup = story ? `
    <section class="capability-detail-section capability-story-summary" data-progress-label="重点结论">
      <div class="capability-detail-section__heading"><span>01</span><h2>重点结论</h2><p>${story.conclusion}</p></div>
      <div class="capability-story-metrics">${story.metrics.map(([value, label, note]) => `<article><strong>${value}</strong><span>${label}</span><p>${note}</p></article>`).join("")}</div>
    </section>
    ${story.chapters.map((chapter) => `<section class="capability-detail-section capability-story-chapter" data-progress-label="${chapter.label}">
      <div class="capability-detail-section__heading"><span>${chapter.index}</span><h2>${chapter.title}</h2><p>${chapter.copy}</p></div>
      ${chapter.custom ? researchVisualMarkup(chapter.custom) : ""}
      ${chapter.images?.length ? `<div class="capability-story-media capability-story-media--evidence ${chapter.images.length > 1 ? "capability-story-media--split media-pair--equal-scroll" : ""}">${chapter.images.map(([src, alt, caption]) => `<figure class="${src.includes("researcher-vs-product-manager") ? "capability-story-media__figure--compact" : ""}"><div class="capability-story-media__image" ${chapter.images.length > 1 ? `tabindex="0" aria-label="可滚动查看完整图片：${alt}"` : ""}><img src="${src}" alt="${alt}" loading="lazy" decoding="async"></div><figcaption><strong>${alt}</strong><span>${caption}</span></figcaption></figure>`).join("")}</div>` : ""}
    </section>`).join("")}
  ` : "";

  host.className = "capability-detail";
  const isOperations = match[1] === "product-operations";
  host.innerHTML = `
    ${detailNavMarkup("/#capabilities", detail.eyebrow)}
    <main class="capability-detail-main container">
      <header class="capability-detail-hero">
        <p>${detail.eyebrow}</p>
        <h1>${detail.title}</h1>
        <div class="capability-detail-hero__intro"><span>Capability / 0${Object.keys(capabilityDetails).indexOf(match[1]) + 1}</span><p>${detail.intro}</p></div>
      </header>
      ${isOperations ? productOperationsMarkup() : storyMarkup}
      ${detailSeriesFooterMarkup(`/project/capability-${nextCapabilitySlug}`, "下一项能力", nextCapability.title)}
    </main>
  `;
  host.dataset.capabilityDetail = "complete";
  return true;
}

function applyOtherWorksModule() {
  const work = document.querySelector("#work");
  if (!work || document.querySelector("#other-works")) return Boolean(work);
  const section = document.createElement("section");
  section.id = "other-works";
  section.className = "other-works section";
  section.innerHTML = `
    <div class="container">
      <div class="other-works__label"><span>03</span><p>其他作品</p></div>
      <button class="other-works-card" type="button" aria-label="查看其他设计作品">
        <div class="other-works-card__copy">
          <p>Visual archive · 34 pages</p>
          <h2>其他设计作品</h2>
          <span>一组早期 App、Web、视觉设计作品。</span>
        </div>
      </button>
    </div>`;
  work.insertAdjacentElement("afterend", section);
  section.querySelector("button").addEventListener("click", () => { location.href = "/project/other-works"; });
  const capabilitiesLabel = document.querySelector("#capabilities .section-label__index");
  const contactLabel = document.querySelector("#contact .section-label__index");
  if (capabilitiesLabel) capabilitiesLabel.textContent = "04";
  if (contactLabel) contactLabel.textContent = "05";
  return true;
}

function applyOtherWorksDetail() {
  if (location.pathname !== "/project/other-works") return false;
  const host = document.querySelector(".detail-404");
  if (!host) return false;
  if (host.dataset.otherWorks === "complete") return true;
  const pages = Array.from({ length: 34 }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    return `<figure class="other-works-page"><img src="/assets/other-works/portfolio-pages/page-${number}.jpg" alt="其他设计作品第 ${index + 1} 页" ${index > 2 ? 'loading="lazy"' : ''}></figure>`;
  }).join("");
  host.className = "other-works-detail";
  host.innerHTML = `
    ${detailNavMarkup("/#other-works", "OTHER WORKS · VISUAL ARCHIVE")}
    <main class="other-works-detail__main container">
      <header class="other-works-detail__hero" data-progress-label="作品说明"><p>OTHER WORKS / 34 PAGES</p><h1>其他设计作品</h1><div><span>Visual archive</span><p>这是一组早期 App、Web、视觉设计作品。</p></div></header>
      <section class="other-works-detail__pages" data-progress-label="完整作品">${pages}</section>
      ${detailSeriesFooterMarkup("/project/capability-user-research", "下一项能力", "用户研究")}
    </main>`;
  host.dataset.otherWorks = "complete";
  return true;
}

function ensureDetailSideProgress() {
  if (!location.pathname.startsWith("/project/") || document.querySelector(".detail-side-progress")) return;
  const sections = [...document.querySelectorAll("[data-progress-label], .project-detail-section")];
  if (sections.length < 2) return;
  sections.forEach((section, index) => { if (!section.id) section.id = `detail-section-${index + 1}`; });
  const progress = document.createElement("aside");
  progress.className = "detail-side-progress";
  progress.setAttribute("aria-label", "页面浏览进度");
  progress.innerHTML = `<span class="detail-side-progress__line"><i></i></span><ol>${sections.map((section, index) => `<li><button data-target="${section.id}"><b>${String(index + 1).padStart(2, "0")}</b><span>${section.dataset.progressLabel || section.querySelector(".project-detail-section__header p")?.textContent || "内容"}</span></button></li>`).join("")}</ol>`;
  document.body.appendChild(progress);
  progress.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => document.getElementById(button.dataset.target)?.scrollIntoView({ behavior: "smooth", block: "start" })));
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const ratio = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    progress.style.setProperty("--detail-progress", ratio);
    let active = 0;
    sections.forEach((section, index) => { if (section.getBoundingClientRect().top <= innerHeight * .42) active = index; });
    progress.querySelectorAll("li").forEach((item, index) => item.classList.toggle("is-active", index === active));
  };
  addEventListener("scroll", update, { passive: true });
  update();
}

const projectCovers = [
  { match: "大数据工作台", route: "big-data-workbench", slug: "bigdata", label: "大数据工作台", type: "数据开发与治理平台", year: "2021 — 2023" },
  { match: "iFCLOUD", route: "ifcloud", slug: "ifcloud", label: "iFCLOUD 多云管理平台", type: "多云管理平台", year: "2019 — 2023" },
  { match: "BOSS Unified Operations", route: "boss-platform", slug: "boss", label: "BOSS 运维运营统一管理平台", type: "统一运维运营平台", year: "2018 — 2021" },
  { match: "QUI Design System", route: "qui-design-system", slug: "qui", label: "QUI Design System", type: "企业级设计系统", year: "2019 — 2024" }
];

const projectStories = {
  bigdata: {
    thesis: "把分散的数据开发、同步、计算与权限能力整合为可理解的工作台，让不同角色能够在同一空间完成复杂任务。",
    chapters: [
      { index: "03", label: "统一工作台", title: "先建立全局感，再进入具体任务", copy: "概览把空间、作业、数据源和运行状态组织在同一信息层级。用户既能快速判断当前环境，也能从高频入口直接进入开发和治理任务。", images: [["overview.jpg", "数据工作台概览", "围绕任务状态、资源入口与常用能力建立清晰的工作起点。"]] },
      { index: "04", label: "空间与权限", title: "让资源边界和协作关系可见", copy: "空间卡片帮助用户按职责快速定位工作域；权限管理把成员、角色与资源范围集中呈现，降低多人协作中的理解成本。", scrollImage: "permissions.png", images: [["spaces.png", "空间卡片视图", "通过状态、角色和摘要信息支持快速选择。"], ["permissions.png", "空间权限管理", "集中管理成员权限与资源访问边界。可在图片内纵向滚动查看完整页面。"]] },
      { index: "05", label: "开发体验", title: "在编码与运行反馈之间保持连续", copy: "实时 SQL 将编辑、运行、结果与状态反馈组织在同一工作区；离线同步脚本模式保留专业用户需要的控制力，同时用结构化参数减少重复配置。", images: [["realtime-sql.png", "实时 SQL 与运行结果", "让编码、执行和结果验证保持在同一上下文。"], ["offline-script.png", "离线同步脚本模式", "面向高级用户提供可控、可复用的同步配置。"]] },
      { index: "06", label: "复杂任务引导", title: "把数据同步配置拆成可验证的步骤", copy: "向导模式围绕数据来源、表过滤、字段映射与运行策略逐步展开。每一步只呈现当前决策所需信息，并保留上下文摘要，降低长流程的出错概率。", images: [["binlog-wizard.png", "实时同步向导", "以分步任务承载复杂配置，并在关键节点提供即时校验。"]] }
    ]
  },
  ifcloud: {
    thesis: "用统一控制面连接多云资源、服务目录、流程编排与监控告警，帮助企业在异构环境中保持一致的管理体验。",
    chapters: [
      { index: "03", label: "统一视角", title: "把异构资源翻译为一致的经营与运维视图", copy: "Overview 同时呈现资源规模、使用趋势、健康度和成本线索，使管理者能快速定位异常，也让执行人员拥有进入具体资源的清晰路径。", images: [["overview.png", "多云总览", "用统一指标语言连接资源、容量与运行趋势。"]] },
      { index: "04", label: "资源与服务", title: "从底层云环境到可消费的服务目录", copy: "云环境详情关注资源池健康、容量与基础设施状态；服务目录则把底层能力封装为用户能够申请和理解的服务，实现管理视角与消费视角的衔接。", images: [["cloud-overview.png", "私有云环境总览", "围绕资源池健康与容量建立运维判断。"], ["service-catalog.png", "服务目录", "将复杂基础设施能力转化为可发现、可申请的服务。"]] },
      { index: "05", label: "流程自动化", title: "让跨云交付过程可视、可配、可追踪", copy: "可视化流程把用户任务、审批、资源操作与通知节点连接起来。设计重点是让流程结构足够直观，同时保留企业级场景需要的条件、角色和异常配置。", images: [["workflow.png", "流程设计器", "用节点与连线表达跨系统协作，降低自动化流程的搭建门槛。"]] },
      { index: "06", label: "监控闭环", title: "从全局发现异常，到批量完成处置", copy: "全屏 Top 监控适合观察多资源趋势，告警记录则支持筛选、确认和批量操作。两种视图共同覆盖“发现—判断—处置”的完整路径。", images: [["monitoring.png", "虚拟资源全屏监控", "在大范围资源中保持趋势与异常的可读性。"], ["alarms.png", "告警记录与批量操作", "用状态、级别和操作反馈提升集中处置效率。"]] }
    ]
  },
  boss: {
    thesis: "围绕资源健康、节点状态、容量趋势与异常处置建立分层运维视图，让复杂基础设施从“可监控”走向“可判断”。",
    chapters: [
      { index: "03", label: "指挥视角", title: "用大屏快速识别关键风险", copy: "监控大屏以健康度、容量、性能趋势和异常排行为主线，在有限空间内强化对比关系，支持值守人员快速判断当前 Zone 的整体状态。", images: [["command-center.png", "单 Zone 监控大屏", "将关键指标、趋势和告警集中在一屏，服务快速态势判断。"]] },
      { index: "04", label: "运维总览", title: "把健康、容量与异常组织成可行动的信息", copy: "单 Zone 总览按照“当前状态—趋势变化—问题对象”逐层组织信息，让用户从总体健康快速下钻到具体资源和服务。", images: [["zone-overview.png", "单 Zone 运维总览", "通过稳定的信息层级支撑日常巡检与问题定位。"], ["node-fleet.png", "大规模计算节点视图", "在高密度场景下兼顾批量比较和单节点状态识别。"]] },
      { index: "05", label: "监控下钻", title: "既看趋势，也能核对具体节点", copy: "图表放大提供聚焦分析空间；网络流量页则把多网卡、多时间范围和节点对比放在同一任务路径中，避免频繁切换页面。", images: [["chart-focus.png", "监控图表聚焦", "保留上下文的同时放大关键趋势。"], ["network-traffic.png", "节点 DVR 流量监控", "支持不同维度的流量比较与时间范围切换。"]] },
      { index: "06", label: "服务诊断", title: "让基础组件状态成为可追踪的诊断入口", copy: "服务进程页统一展示关键基础组件及状态，把实例规模、异常和操作入口组织为稳定模式，方便运维人员快速进入后续诊断。", images: [["services.png", "基础服务进程", "通过一致的状态和操作语言降低多组件运维成本。"]] }
    ]
  },
  qui: {
    thesis: "QUI 不是一套静态组件展示，而是连接设计、研发与多产品团队的共享语言：从基础变量到组件资产，再到主题模式和使用流程，让一致性能够真正进入日常协作。",
    chapters: [
      { index: "04", label: "系统方法", title: "先统一资源、工具与组件使用方式", copy: "规范从团队真实协作流程出发，明确设计资源、字体、Figma 插件、图标库以及组件调用和切换方式。设计系统首先解决的是团队如何找到、理解并正确使用资产。", images: [["introduction.png", "QUI 使用与协作说明", "从资源入口、设计工具到组件调用规则，建立统一的协作起点。"]] },
      { index: "05", label: "基础色板", title: "用完整色阶承载企业级产品状态", copy: "色彩体系覆盖 Neutral、Green、Red、Yellow、Blue、Purple、Cyan 与 Orange，并将可访问性对比度作为基础约束。丰富色阶既支撑品牌表达，也覆盖信息、告警、状态和数据可视化。", images: [["base-color-palette.png", "基础色板与无障碍标准", "按语义和色阶组织全局颜色，并标注不同文字场景的对比度等级。"]] },
      { index: "06", label: "字体体系", title: "让中文、英文、数字和等宽信息各司其职", copy: "字体规范同时考虑 macOS 与 Windows 环境，分别定义中文、英文数字、等宽内容与特殊金额的字体回退；字号、行高、字重和应用样式形成稳定层级。", images: [["typography.png", "字体与排版规范", "从字体栈、字号行高到实际文字样式，保证跨平台信息层级一致。"]] },
      { index: "07", label: "主题变量", title: "一套语义变量适配不同品牌与视觉主题", copy: "通过 Figma Variables 和 Mode 管理主题切换，组件与页面不再依赖固定色值。品牌色、插画与图标可以随主题联动，同时保持相同的结构和交互语义。", images: [["modes-for-variables.png", "Variables 主题模式", "以变量模式统一组件、插画和图标在不同主题中的视觉表达。"]] },
      { index: "08", label: "基础组件", title: "用完整组件覆盖高频企业级交互", copy: "组件库覆盖布局、通用、数据展示、数据录入、反馈、导航和其他工具类型。组件以真实业务使用频率持续扩展，使产品团队能够快速组合页面并保持一致体验。", images: [["base-components.png", "QUI 基础组件全景", "从按钮、表单和表格到导航与反馈，建立可复用的企业级组件资产。"]] },
      { index: "09", label: "体系演进", title: "从早期控件资产走向可维护的设计系统", copy: "早期 Axure 控件沉淀了大量通用交互模式，也暴露出样式分散、复用边界不清的问题。QUI 将这些经验重新组织为有语义、有状态、可同步迭代的组件与变量体系。", images: [["axure.png", "早期 Axure 控件资产", "保留成熟交互经验，并将其升级为跨工具、可维护的系统化资产。"]] }
    ]
  }
};

function quiVisual(type) {
  if (type === "tokens") return `<div class="qui-evidence qui-evidence--tokens"><div class="qui-token-type"><span>Typography / Display</span><strong>Aa 字体与层级</strong><p>16 / 24 · 14 / 20 · 12 / 20</p></div><div class="qui-token-colors"><i></i><i></i><i></i><i></i><i></i></div><div class="qui-token-scale">${[4,8,12,16,24,32].map((n) => `<span style="--size:${n}px">${n}</span>`).join("")}</div></div>`;
  if (type === "components") return `<div class="qui-evidence qui-evidence--components"><div class="qui-component-row"><button>Primary</button><button>Secondary</button><button disabled>Disabled</button></div><label><span>Input / Focus</span><input value="Design system" readonly></label><div class="qui-status-row"><span>Success</span><span>Warning</span><span>Error</span></div><div class="qui-toggle"><i></i><b></b></div></div>`;
  return `<div class="qui-evidence qui-evidence--governance"><div class="qui-tree"><span>Foundations</span><span>Components</span><span>Patterns</span><span>Product screens</span></div><div class="qui-governance-card"><small>Component coverage</small><strong>Design → Build → Audit</strong><div><i></i><i></i><i></i><i></i></div></div></div>`;
}

function applyProjectCoverLayout() {
  const featured = document.querySelector(".projects__featured");
  const others = document.querySelector(".projects__others");
  if (!featured || featured.dataset.coverLayout === "complete") return Boolean(featured);

  const candidates = [
    ...document.querySelectorAll(".projects__featured > *"),
    ...document.querySelectorAll(".projects__others-grid > *")
  ];

  const selected = projectCovers.map((project) => ({
    ...project,
    node: candidates.find((candidate) => candidate.textContent.includes(project.match))
  }));

  if (selected.some((project) => !project.node)) return false;

  featured.replaceChildren();
  selected.forEach((project, index) => {
    const card = project.node;
    card.className = "project-cover-card";
    card.dataset.projectCover = project.slug;
    card.setAttribute("aria-label", `查看项目：${project.label}`);
    card.innerHTML = `
      <img class="project-cover-image project-cover-image--static project-cover-image--dark" src="/assets/project-covers/${project.slug}-dark.png?v=10" alt="${project.label} Dark Mode 封面" loading="eager" decoding="async" />
      <img class="project-cover-image project-cover-image--static project-cover-image--light" src="/assets/project-covers/${project.slug}-light.png?v=10" alt="${project.label} Light Mode 封面" loading="eager" decoding="async" />
      <span class="project-cover-clean-bg" aria-hidden="true"></span>
      <span class="project-cover-motion-window" aria-hidden="true">
        <img class="project-cover-image project-cover-image--motion project-cover-image--dark" src="/assets/project-covers/${project.slug}-dark.png?v=10" alt="" loading="eager" decoding="async" />
        <img class="project-cover-image project-cover-image--motion project-cover-image--light" src="/assets/project-covers/${project.slug}-light.png?v=10" alt="" loading="eager" decoding="async" />
      </span>
    `;
    featured.appendChild(card);
  });

  if (others) others.remove();
  featured.dataset.coverLayout = "complete";
  return true;
}

function applyDetailPageLayout() {
  if (!location.pathname.startsWith("/project/")) return false;
  const content = document.querySelector(".detail__content");
  if (!content) return false;
  if (content.dataset.portfolioDetail === "complete") return true;

  const backButton = document.querySelector(".detail__nav-back");
  if (backButton && backButton.tagName !== "A") {
    const backLink = document.createElement("a");
    backLink.className = backButton.className;
    backLink.href = "/#work";
    backLink.innerHTML = `${backButton.querySelector("svg")?.outerHTML || "←"}<span>返回</span>`;
    backButton.replaceWith(backLink);
  }

  const route = location.pathname.split("/").filter(Boolean).pop();
  const project = projectCovers.find((item) => item.route === route);
  if (!project) return false;
  const story = projectStories[project.slug];

  const navYear = document.querySelector(".detail__nav-year");
  if (navYear) navYear.textContent = project.year;

  const title = content.querySelector(".detail__title")?.textContent.trim() || project.label;
  const intro = content.querySelector(".detail__intro p")?.textContent.trim() || "项目背景与目标将在这里补充。";
  const tags = [...content.querySelectorAll(".detail__tag")].map((item) => item.textContent.trim());
  const contributions = [...content.querySelectorAll(".detail__highlight-card p")].map((item) => item.textContent.trim());
  const resolvedIntro = project.slug === "qui"
    ? "QUI Design System 是面向青云企业级产品线建立的统一设计基础设施。项目将分散的品牌、视觉和交互经验沉淀为可被设计与研发共同使用的色彩、字体、变量、组件和协作规范。"
    : project.slug === "boss"
      ? "BOSS 统一运维运营管理平台是青云面向大规模企业云环境的统一管理入口，整合资源监控、计费管理与运维告警等核心能力。作为该项目的主责产品设计师，我从 0 到 1 主导完成整体体验设计，并持续负责监控大屏、计算节点详情、运维总览与服务诊断等核心模块，帮助运维团队从全局态势到单节点粒度高效管理云资源。"
      : intro;
  const resolvedTags = project.slug === "qui"
    ? ["Design System", "Design Tokens", "Figma Variables", "Component Library"]
    : tags;
  const resolvedContributions = project.slug === "qui"
    ? [
        "调研各产品与核心组件的使用场景，梳理共性、差异与抽象层级，建立色彩、字体、栅格和组件的统一规范框架。",
        "参与组件资产和变量模式建设，使品牌主题与组件状态能够在 Figma 中集中维护。",
        "完善组件调用、替换与使用说明，降低设计协作和页面搭建过程中的重复成本。"
      ]
    : project.slug === "boss"
      ? [
          "从 0 到 1 主导 BOSS 整体体验设计，建立覆盖资源态势、日常巡检、异常定位与服务诊断的统一信息架构。",
          "主导监控大屏设计，将多维资源状态整合为可视化仪表盘，支持单 Zone 与跨 Zone 的全局视角切换。",
          "完成计算节点详情与大规模节点监控模式设计，覆盖 CPU、内存、磁盘、网络等指标，并兼顾高密度场景的可读性。",
          "设计运维总览与服务进程管理模块，以一致的状态语言呈现基础组件健康度、依赖关系与诊断入口。"
        ]
      : contributions;
  const projectIndex = projectCovers.indexOf(project);
  const nextProject = projectCovers[(projectIndex + 1) % projectCovers.length];

  const tagMarkup = resolvedTags.map((tag) => `<span class="project-detail-tag">${tag}</span>`).join("");
  const contributionMarkup = resolvedContributions.map((item, index) => `
    <article class="project-detail-contribution">
      <span class="project-detail-contribution__index">${String(index + 1).padStart(2, "0")}</span>
      <p>${item}</p>
    </article>
  `).join("");

  content.innerHTML = `
    <article class="project-detail-shell project-detail-shell--${project.slug}">
      <section class="project-detail-cover" aria-label="${project.label} 项目封面">
        <h1 class="project-detail-sr-only">${title}</h1>
        <img class="project-detail-cover__image project-cover-image--dark" src="/assets/project-covers/${project.slug}-dark.png?v=10" alt="${project.label} Dark Mode 封面" />
        <img class="project-detail-cover__image project-cover-image--light" src="/assets/project-covers/${project.slug}-light.png?v=10" alt="${project.label} Light Mode 封面" />
      </section>

      <section class="project-detail-section project-detail-overview">
        <header class="project-detail-section__header">
          <span class="project-detail-section__index">01</span>
          <p>Project overview</p>
        </header>
        <div class="project-detail-overview__grid">
          <div>
            <p class="project-detail-kicker">${project.type}</p>
            <h2>${title}</h2>
          </div>
          <div class="project-detail-overview__copy">
            <p>${resolvedIntro}</p>
            <div class="project-detail-tags">${tagMarkup}</div>
          </div>
        </div>
      </section>

      <section class="project-detail-section">
        <header class="project-detail-section__header">
          <span class="project-detail-section__index">02</span>
          <p>My contribution</p>
        </header>
        <h2 class="project-detail-section__title">我的贡献</h2>
        <div class="project-detail-contributions">${contributionMarkup}</div>
      </section>

      ${story ? `<section class="project-detail-section project-story-thesis" data-progress-label="设计命题">
        <header class="project-detail-section__header"><span class="project-detail-section__index">03</span><p>Design thesis</p></header>
        <div class="project-story-thesis__inner"><p>重点结论</p><h2>${story.thesis}</h2></div>
      </section>
      ${story.chapters.map((chapter) => `<section class="project-detail-section project-story-chapter" data-progress-label="${chapter.label}">
        <header class="project-detail-section__header"><span class="project-detail-section__index">${chapter.index}</span><p>${chapter.label}</p></header>
        <div class="project-story-chapter__heading"><h2>${chapter.title}</h2><p>${chapter.copy}</p></div>
        ${chapter.custom ? quiVisual(chapter.custom) : `<div class="project-story-figures ${chapter.images.length > 1 ? "project-story-figures--split media-pair--equal-scroll" : ""}">${chapter.images.map(([file, alt, caption]) => `<figure><div class="project-story-image" ${chapter.images.length > 1 ? `tabindex="0" aria-label="可滚动查看完整图片：${alt}"` : ""}><img src="/assets/detail-media/${project.slug}/${file}" alt="${alt}" loading="lazy" decoding="async"></div><figcaption><strong>${alt}</strong><span>${caption}</span></figcaption></figure>`).join("")}</div>`}
      </section>`).join("")}` : ""}
      ${detailSeriesFooterMarkup(`/project/${nextProject.route}`, "下一个项目", nextProject.label)}
    </article>
  `;
  content.dataset.portfolioDetail = "complete";
  return true;
}

function applyPageCustomizations() {
  const results = [
    applySelectedLogo(),
    applyHeroContentChanges(),
    applyHeadlineLayout(),
    applyCapabilityChanges(),
    applyProjectCoverLayout(),
    applyOtherWorksModule()
  ];
  return results.every(Boolean);
}

function ensureDetailImageLightbox() {
  let lightbox = document.querySelector(".detail-image-lightbox");
  if (!lightbox) {
    lightbox = document.createElement("div");
    lightbox.className = "detail-image-lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "图片大图预览");
    lightbox.setAttribute("aria-hidden", "true");
    lightbox.innerHTML = `
      <button class="detail-image-lightbox__close" type="button" aria-label="关闭大图预览">×</button>
      <div class="detail-image-lightbox__viewport">
        <img class="detail-image-lightbox__image" alt="">
      </div>
      <p class="detail-image-lightbox__caption"></p>
    `;
    document.body.appendChild(lightbox);

    const close = () => {
      if (!lightbox.classList.contains("is-open")) return;
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.documentElement.classList.remove("has-image-lightbox");
      const trigger = lightbox._trigger;
      lightbox._trigger = null;
      trigger?.focus({ preventScroll: true });
    };
    lightbox._close = close;
    lightbox.querySelector(".detail-image-lightbox__close").addEventListener("click", close);
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && lightbox.classList.contains("is-open")) close();
    });
  }

  const selector = [
    ".project-detail-shell img",
    ".capability-detail-main img",
    ".other-works-detail__pages img",
    ".project-detail-cover__image",
    ".project-story-image img",
    ".capability-story-media__image img",
    ".other-works-page img"
  ].join(",");

  document.querySelectorAll(selector).forEach((image) => {
    if (image.dataset.lightboxReady === "true") return;
    image.dataset.lightboxReady = "true";
    image.classList.add("detail-image-zoomable");
    image.setAttribute("tabindex", "0");
    image.setAttribute("role", "button");
    image.setAttribute("aria-label", `${image.alt || "详情图片"}，点击放大查看`);

    const open = () => {
      const preview = lightbox.querySelector(".detail-image-lightbox__image");
      const caption = lightbox.querySelector(".detail-image-lightbox__caption");
      preview.src = image.currentSrc || image.src;
      preview.alt = image.alt || "详情图片大图预览";
      caption.textContent = image.alt || "";
      lightbox._trigger = image;
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.documentElement.classList.add("has-image-lightbox");
      lightbox.querySelector(".detail-image-lightbox__viewport").scrollTo(0, 0);
      lightbox.querySelector(".detail-image-lightbox__close").focus({ preventScroll: true });
    };
    image.addEventListener("click", open);
    image.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
  });
}

function normalizePairedDetailImages() {
  const normalize = (grid) => {
    const figures = [...grid.querySelectorAll(":scope > figure")];
    const images = figures.map((figure) => figure.querySelector("img"));
    if (images.length < 2 || images.some((image) => !image?.complete || !image.naturalWidth)) return;

    const ratios = images.map((image) => image.naturalHeight / image.naturalWidth);
    const shortestRatio = Math.min(...ratios);
    const viewports = figures.map((figure) => figure.querySelector(".project-story-image, .capability-story-media__image"));
    const availableWidths = viewports.map((viewport) => viewport?.getBoundingClientRect().width || 0).filter(Boolean);
    if (!availableWidths.length) return;
    const baselineHeight = Math.max(180, Math.round(Math.min(...availableWidths) * shortestRatio));

    figures.forEach((figure, index) => {
      const shouldScroll = ratios[index] > shortestRatio * 1.035;
      figure.classList.toggle("is-paired-media-scroll", shouldScroll);
      const viewport = figure.querySelector(".project-story-image, .capability-story-media__image");
      if (!viewport) return;
      viewport.style.height = `${baselineHeight}px`;
      viewport.style.aspectRatio = "auto";
      if (shouldScroll) {
        viewport.setAttribute("tabindex", "0");
        viewport.setAttribute("aria-label", `${images[index].alt || "长图"}，可在图片内纵向滚动查看完整内容`);
      }
    });
  };

  document.querySelectorAll(".media-pair--equal-scroll").forEach((grid) => {
    [...grid.querySelectorAll("img")].forEach((image) => {
      if (!image.complete && image.dataset.pairedLoadReady !== "true") {
        image.dataset.pairedLoadReady = "true";
        image.addEventListener("load", () => normalize(grid), { once: true });
      }
    });
    normalize(grid);
    if (window.ResizeObserver && grid.dataset.pairedResizeReady !== "true") {
      grid.dataset.pairedResizeReady = "true";
      window.__pairedMediaResizeObserver ||= new ResizeObserver((entries) => {
        entries.forEach((entry) => normalize(entry.target));
      });
      window.__pairedMediaResizeObserver.observe(grid);
    }
  });
}

function bindDetailFooterActions() {
  document.querySelectorAll(".detail-series-footer__top").forEach((button) => {
    if (button.dataset.topReady === "true") return;
    button.dataset.topReady = "true";
    button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  });
}

function enableSeamlessInternalNavigation() {
  if (document.documentElement.dataset.internalNavigationReady === "true") return;
  document.documentElement.dataset.internalNavigationReady = "true";

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = event.target.closest("a[href]");
    if (!anchor || anchor.target || anchor.hasAttribute("download")) return;
    const url = new URL(anchor.href, location.href);
    if (url.origin !== location.origin || !url.pathname.startsWith("/")) return;

    // Each detail page is assembled from its route on initial load. A
    // pushState-only transition keeps the previous page's completed DOM and
    // therefore looks like a plain "back to top" action. Series links use a
    // normal same-origin navigation so the requested detail is rebuilt.
    if (anchor.classList.contains("detail-series-footer__next")) {
      event.preventDefault();
      window.location.assign(`${url.pathname}${url.search}${url.hash}`);
      return;
    }

    event.preventDefault();
    history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
    window.scrollTo({ top: 0, behavior: "instant" });

    /* When returning to the homepage with a hash (e.g. /#work),
       scroll to the corresponding section after the DOM settles.
       We must temporarily disable CSS scroll-behavior: smooth and
       repeatedly force the position, because React Router's own
       scroll restoration can override our instant scroll and cause
       a visible smooth animation through unrelated page areas. */
    if (url.hash && !url.pathname.startsWith("/project/")) {
      const html = document.documentElement;
      const origBehavior = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";

      const forceScroll = () => {
        const target = document.querySelector(url.hash);
        if (target) {
          const top = target.getBoundingClientRect().top + window.scrollY
            - (parseFloat(getComputedStyle(target).scrollMarginTop) || 0);
          window.scrollTo({ top, behavior: "instant" });
        }
      };

      window.scrollTo({ top: 0, behavior: "instant" });
      requestAnimationFrame(() => { forceScroll(); });
      requestAnimationFrame(() => requestAnimationFrame(forceScroll));
      setTimeout(forceScroll, 30);
      setTimeout(forceScroll, 80);
      setTimeout(forceScroll, 200);
      setTimeout(forceScroll, 500);
      setTimeout(() => { forceScroll(); html.style.scrollBehavior = origBehavior; }, 800);
    }
  });

  let activeTheme = document.documentElement.getAttribute("data-theme");
  new MutationObserver(() => {
    const nextTheme = document.documentElement.getAttribute("data-theme");
    if (!nextTheme || nextTheme === activeTheme) return;
    activeTheme = nextTheme;
    location.reload();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
}

function syncCurrentPage() {
  /* Cleanup: close any lingering lightbox when leaving detail pages.
     The lightbox adds `has-image-lightbox` to <html> which sets
     overflow:hidden, locking page scroll. Remove it on navigation. */
  const isDetail = location.pathname.startsWith("/project/");
  if (!isDetail) {
    document.documentElement.classList.remove("has-image-lightbox");
    const openLightbox = document.querySelector(".detail-image-lightbox.is-open");
    if (openLightbox && openLightbox._close) openLightbox._close();
  }

  if (location.pathname === "/project/icon-system-preview") {
    applyIconPreview();
  } else if (location.pathname === "/project/other-works") {
    applyOtherWorksDetail();
  } else if (location.pathname.startsWith("/project/capability-")) {
    applyCapabilityDetailLayout();
  } else if (location.pathname.startsWith("/project/")) {
    applyDetailPageLayout();
  } else {
    applyPageCustomizations();
    restoreHeroTypingAfterIntro();
  }
  ensureDetailSideProgress();
  ensureDetailImageLightbox();
  normalizePairedDetailImages();
  bindDetailFooterActions();
  enableSeamlessInternalNavigation();

  /* Scroll restoration: detail pages always start at the top.
     Hash scrolling for homepage sections is handled by the click
     handler in enableSeamlessInternalNavigation, not here, to
     avoid an infinite loop caused by the MutationObserver
     re-triggering syncCurrentPage on every DOM mutation. */
  if (isDetail) {
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "instant" });
    scrollToTop();
    requestAnimationFrame(scrollToTop);
    setTimeout(scrollToTop, 50);
    setTimeout(scrollToTop, 150);
  }
}

let syncQueued = false;
function queuePageSync() {
  if (syncQueued) return;
  syncQueued = true;
  requestAnimationFrame(() => {
    syncQueued = false;
    syncCurrentPage();
  });
}

syncCurrentPage();
const observer = new MutationObserver(queuePageSync);
observer.observe(document.documentElement, { childList: true, subtree: true });
window.addEventListener("popstate", queuePageSync);
