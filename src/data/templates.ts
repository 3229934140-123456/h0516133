import { Template } from "@/types";

const equityTemplate: Template = {
  id: "tpl-equity",
  name: "股权投资尽职调查清单",
  category: "equity",
  description: "适用于私募股权投资、风险投资等场景的全面尽调清单，涵盖公司概况、财务、法律、业务、人力及知识产权等核心领域。",
  createdAt: "2025-01-15T08:00:00Z",
  updatedAt: "2025-05-20T10:30:00Z",
  sections: [
    {
      id: "eq-s1", name: "公司概况", order: 1,
      items: [
        { id: "eq-1-1", name: "公司营业执照", description: "最新有效的营业执照副本", required: true, acceptedFormats: ["PDF", "JPG", "PNG"] },
        { id: "eq-1-2", name: "公司章程", description: "现行有效的公司章程及所有修正案", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "eq-1-3", name: "股权结构图", description: "完整股权穿透图，追溯至最终受益人", required: true, acceptedFormats: ["PDF", "XLSX", "PNG"] },
        { id: "eq-1-4", name: "股东名册", description: "截至最近日期的股东名册", required: true, acceptedFormats: ["PDF", "XLSX"] },
        { id: "eq-1-5", name: "董事会及高管名单", description: "现任董事、监事及高级管理人员名单及简历", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "eq-1-6", name: "公司组织架构图", description: "公司内部组织架构及部门职能说明", required: false, acceptedFormats: ["PDF", "PNG"] },
        { id: "eq-1-7", name: "历史沿革说明", description: "公司设立至今的重大变更事项说明", required: true, acceptedFormats: ["PDF", "DOCX"] },
      ]
    },
    {
      id: "eq-s2", name: "财务数据", order: 2,
      items: [
        { id: "eq-2-1", name: "近三年审计报告", description: "经审计的最近三个年度财务报告", required: true, acceptedFormats: ["PDF"] },
        { id: "eq-2-2", name: "最近一期财务报表", description: "最近月份/季度的未审计财务报表", required: true, acceptedFormats: ["PDF", "XLSX"] },
        { id: "eq-2-3", name: "银行对账单", description: "主要银行账户近12个月对账单", required: true, acceptedFormats: ["PDF"] },
        { id: "eq-2-4", name: "税务申报表", description: "近三年企业所得税及增值税申报表", required: true, acceptedFormats: ["PDF"] },
        { id: "eq-2-5", name: "重大债权债务清单", description: "金额超过100万的债权债务明细", required: true, acceptedFormats: ["PDF", "XLSX"] },
        { id: "eq-2-6", name: "关联交易说明", description: "与关联方之间的交易类型和金额说明", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "eq-2-7", name: "资产评估报告", description: "最新资产评估报告（如有）", required: false, acceptedFormats: ["PDF"] },
      ]
    },
    {
      id: "eq-s3", name: "法律合规", order: 3,
      items: [
        { id: "eq-3-1", name: "诉讼仲裁情况", description: "正在进行或近三年的诉讼仲裁案件清单", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "eq-3-2", name: "行政处罚记录", description: "近三年受到的行政处罚决定书", required: true, acceptedFormats: ["PDF"] },
        { id: "eq-3-3", name: "知识产权登记", description: "专利、商标、著作权等权利证书", required: true, acceptedFormats: ["PDF", "JPG"] },
        { id: "eq-3-4", name: "重大合同清单", description: "正在履行的重大合同（金额>50万）", required: true, acceptedFormats: ["PDF", "XLSX"] },
        { id: "eq-3-5", name: "许可证和资质", description: "经营所需的各类许可证和资质证书", required: true, acceptedFormats: ["PDF", "JPG"] },
        { id: "eq-3-6", name: "劳动合规说明", description: "员工社保、公积金缴纳情况说明", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "eq-3-7", name: "数据合规说明", description: "个人信息保护和数据安全合规说明", required: true, acceptedFormats: ["PDF", "DOCX"] },
      ]
    },
    {
      id: "eq-s4", name: "业务运营", order: 4,
      items: [
        { id: "eq-4-1", name: "商业模式说明", description: "公司商业模式、盈利模式及核心竞争力的详细说明", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "eq-4-2", name: "主要客户清单", description: "前十大客户及销售额占比", required: true, acceptedFormats: ["PDF", "XLSX"] },
        { id: "eq-4-3", name: "主要供应商清单", description: "前十大供应商及采购额占比", required: true, acceptedFormats: ["PDF", "XLSX"] },
        { id: "eq-4-4", name: "市场份额分析", description: "公司产品/服务在相关市场的份额分析", required: false, acceptedFormats: ["PDF", "DOCX"] },
        { id: "eq-4-5", name: "产品/服务介绍", description: "核心产品或服务的详细技术文档", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "eq-4-6", name: "销售渠道说明", description: "各销售渠道的销售额及占比", required: true, acceptedFormats: ["PDF", "XLSX"] },
        { id: "eq-4-7", name: "研发投入说明", description: "近三年研发投入及主要研发项目", required: true, acceptedFormats: ["PDF", "DOCX"] },
      ]
    },
    {
      id: "eq-s5", name: "人力资源", order: 5,
      items: [
        { id: "eq-5-1", name: "员工花名册", description: "全体员工花名册（含入职时间、岗位、薪酬范围）", required: true, acceptedFormats: ["PDF", "XLSX"] },
        { id: "eq-5-2", name: "核心团队简历", description: "核心管理团队和技术骨干的详细简历", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "eq-5-3", name: "股权激励方案", description: "员工期权/股权激励计划及执行情况", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "eq-5-4", name: "劳动合同模板", description: "公司现行劳动合同模板", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "eq-5-5", name: "竞业限制协议", description: "核心员工签署的竞业限制协议", required: false, acceptedFormats: ["PDF"] },
        { id: "eq-5-6", name: "离职率数据", description: "近三年员工离职率及关键岗位流失情况", required: false, acceptedFormats: ["PDF", "XLSX"] },
        { id: "eq-5-7", name: "薪酬福利制度", description: "公司薪酬体系和福利政策说明", required: true, acceptedFormats: ["PDF", "DOCX"] },
      ]
    },
    {
      id: "eq-s6", name: "知识产权", order: 6,
      items: [
        { id: "eq-6-1", name: "专利清单", description: "所有已授权和申请中的专利清单", required: true, acceptedFormats: ["PDF", "XLSX"] },
        { id: "eq-6-2", name: "商标注册证", description: "所有已注册商标的证书", required: true, acceptedFormats: ["PDF", "JPG"] },
        { id: "eq-6-3", name: "软件著作权", description: "软件著作权登记证书", required: true, acceptedFormats: ["PDF", "JPG"] },
        { id: "eq-6-4", name: "域名及网站", description: "公司拥有的域名及运营的网站清单", required: false, acceptedFormats: ["PDF", "XLSX"] },
        { id: "eq-6-5", name: "知识产权纠纷", description: "知识产权相关的纠纷、侵权情况说明", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "eq-6-6", name: "技术许可协议", description: "作为许可方或被许可方的技术许可协议", required: false, acceptedFormats: ["PDF"] },
        { id: "eq-6-7", name: "商业秘密保护措施", description: "公司商业秘密保护制度和执行情况", required: true, acceptedFormats: ["PDF", "DOCX"] },
      ]
    },
  ]
};

const mergerTemplate: Template = {
  id: "tpl-merger",
  name: "并购交易尽职调查清单",
  category: "merger",
  description: "适用于企业并购重组场景的深度尽调清单，重点关注战略适配、整合风险、资产质量及合规要求。",
  createdAt: "2025-02-10T09:00:00Z",
  updatedAt: "2025-06-01T14:20:00Z",
  sections: [
    {
      id: "mg-s1", name: "战略适配", order: 1,
      items: [
        { id: "mg-1-1", name: "战略规划文件", description: "公司中长期战略规划及年度经营计划", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "mg-1-2", name: "业务协同分析", description: "与收购方业务协同效应的详细分析", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "mg-1-3", name: "市场定位报告", description: "公司在各业务领域的市场定位和竞争优势", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "mg-1-4", name: "管理层访谈记录", description: "核心管理层访谈纪要", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "mg-1-5", name: "行业分析报告", description: "公司所处行业的发展趋势和竞争格局", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "mg-1-6", name: "尽职调查问卷", description: "管理层填写的尽职调查问卷回复", required: true, acceptedFormats: ["PDF", "XLSX"] },
        { id: "mg-1-7", name: "标的公司估值模型", description: "各估值方法下的估值模型及参数假设", required: true, acceptedFormats: ["PDF", "XLSX"] },
        { id: "mg-1-8", name: "交易结构建议", description: "交易结构设计及税务影响分析", required: true, acceptedFormats: ["PDF", "DOCX"] },
      ]
    },
    {
      id: "mg-s2", name: "财务审计", order: 2,
      items: [
        { id: "mg-2-1", name: "近三年审计报告", description: "经审计的最近三个年度财务报告", required: true, acceptedFormats: ["PDF"] },
        { id: "mg-2-2", name: "管理账明细", description: "近三年管理报表及科目余额表", required: true, acceptedFormats: ["PDF", "XLSX"] },
        { id: "mg-2-3", name: "现金流量分析", description: "经营活动现金流量的详细分析", required: true, acceptedFormats: ["PDF", "XLSX"] },
        { id: "mg-2-4", name: "应收账款账龄", description: "应收账款账龄分析及坏账准备", required: true, acceptedFormats: ["PDF", "XLSX"] },
        { id: "mg-2-5", name: "存货明细", description: "存货构成、库龄及跌价准备", required: true, acceptedFormats: ["PDF", "XLSX"] },
        { id: "mg-2-6", name: "固定资产清单", description: "主要固定资产清单及折旧明细", required: true, acceptedFormats: ["PDF", "XLSX"] },
        { id: "mg-2-7", name: "无形资产明细", description: "无形资产构成及摊销明细", required: true, acceptedFormats: ["PDF", "XLSX"] },
        { id: "mg-2-8", name: "或有负债说明", description: "担保、承诺等或有负债情况", required: true, acceptedFormats: ["PDF", "DOCX"] },
      ]
    },
    {
      id: "mg-s3", name: "法律风险", order: 3,
      items: [
        { id: "mg-3-1", name: "公司设立及变更文件", description: "公司设立至今的所有工商变更登记文件", required: true, acceptedFormats: ["PDF"] },
        { id: "mg-3-2", name: "股权质押登记", description: "股权质押、冻结等权利限制情况", required: true, acceptedFormats: ["PDF"] },
        { id: "mg-3-3", name: "诉讼仲裁汇总", description: "全部未结及近三年已结诉讼仲裁案件", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "mg-3-4", name: "合规审查报告", description: "各业务条线的合规审查报告", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "mg-3-5", name: "环境保护合规", description: "环评报告及排污许可证等环保文件", required: true, acceptedFormats: ["PDF"] },
        { id: "mg-3-6", name: "反垄断申报材料", description: "经营者集中申报相关材料（如需）", required: false, acceptedFormats: ["PDF", "DOCX"] },
        { id: "mg-3-7", name: "数据合规审计", description: "数据安全和个人信息保护的合规审计报告", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "mg-3-8", name: "跨境投资审批", description: "涉及外资准入、外汇管理等审批文件", required: false, acceptedFormats: ["PDF"] },
      ]
    },
    {
      id: "mg-s4", name: "运营整合", order: 4,
      items: [
        { id: "mg-4-1", name: "业务流程图", description: "核心业务流程图及SOP文件", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "mg-4-2", name: "IT系统架构", description: "信息系统架构及软硬件资产清单", required: true, acceptedFormats: ["PDF", "XLSX"] },
        { id: "mg-4-3", name: "供应链分析", description: "供应链结构、关键供应商依赖度分析", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "mg-4-4", name: "客户关系分析", description: "主要客户合作关系、续约率分析", required: true, acceptedFormats: ["PDF", "XLSX"] },
        { id: "mg-4-5", name: "运营数据看板", description: "关键运营指标（KPI）的历史数据", required: true, acceptedFormats: ["PDF", "XLSX"] },
        { id: "mg-4-6", name: "物业及租赁", description: "办公场所租赁合同及产权文件", required: true, acceptedFormats: ["PDF"] },
        { id: "mg-4-7", name: "保险清单", description: "公司购买的所有保险品种及保额", required: true, acceptedFormats: ["PDF", "XLSX"] },
        { id: "mg-4-8", name: "整合风险评估", description: "并购整合潜在风险及应对方案", required: true, acceptedFormats: ["PDF", "DOCX"] },
      ]
    },
    {
      id: "mg-s5", name: "技术资产", order: 5,
      items: [
        { id: "mg-5-1", name: "技术架构文档", description: "系统技术架构及核心代码仓库信息", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "mg-5-2", name: "专利及软著清单", description: "全部专利和软件著作权清单", required: true, acceptedFormats: ["PDF", "XLSX"] },
        { id: "mg-5-3", name: "技术团队结构", description: "研发团队规模、层级及关键技术人员", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "mg-5-4", name: "技术债务评估", description: "现有系统技术债务及待解决的技术问题", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "mg-5-5", name: "开源组件清单", description: "使用的开源组件及许可证合规性审查", required: true, acceptedFormats: ["PDF", "XLSX"] },
        { id: "mg-5-6", name: "数据安全措施", description: "数据加密、访问控制等安全措施说明", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "mg-5-7", name: "第三方服务依赖", description: "对外部第三方服务和API的依赖分析", required: false, acceptedFormats: ["PDF", "XLSX"] },
        { id: "mg-5-8", name: "技术路线图", description: "产品技术演进路线图", required: false, acceptedFormats: ["PDF", "DOCX"] },
      ]
    },
    {
      id: "mg-s6", name: "人力资源", order: 6,
      items: [
        { id: "mg-6-1", name: "组织架构图", description: "公司完整组织架构及汇报关系", required: true, acceptedFormats: ["PDF", "PNG"] },
        { id: "mg-6-2", name: "员工花名册", description: "全体员工详细信息花名册", required: true, acceptedFormats: ["PDF", "XLSX"] },
        { id: "mg-6-3", name: "薪酬结构分析", description: "各层级薪酬结构及市场对标分析", required: true, acceptedFormats: ["PDF", "XLSX"] },
        { id: "mg-6-4", name: "社保公积金缴纳", description: "社保及公积金缴纳基数和比例", required: true, acceptedFormats: ["PDF", "XLSX"] },
        { id: "mg-6-5", name: "劳动合同样本", description: "各类型劳动合同模板", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "mg-6-6", name: "竞业限制清单", description: "签署竞业限制协议的员工清单", required: true, acceptedFormats: ["PDF", "XLSX"] },
        { id: "mg-6-7", name: "员工福利计划", description: "补充医疗、年金等福利计划", required: false, acceptedFormats: ["PDF", "DOCX"] },
        { id: "mg-6-8", name: "工会及集体合同", description: "工会组织及集体合同（如有）", required: false, acceptedFormats: ["PDF"] },
      ]
    },
    {
      id: "mg-s7", name: "合规监管", order: 7,
      items: [
        { id: "mg-7-1", name: "行业资质许可", description: "行业准入所需的各类许可和资质", required: true, acceptedFormats: ["PDF", "JPG"] },
        { id: "mg-7-2", name: "监管检查记录", description: "近三年监管机构检查及整改情况", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "mg-7-3", name: "内控制度", description: "公司内部控制制度体系文件", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "mg-7-4", name: "反洗钱合规", description: "反洗钱内控制度及执行情况", required: false, acceptedFormats: ["PDF", "DOCX"] },
        { id: "mg-7-5", name: "出口管制审查", description: "涉及出口管制的合规审查材料", required: false, acceptedFormats: ["PDF", "DOCX"] },
        { id: "mg-7-6", name: "ESG报告", description: "环境、社会及治理相关信息", required: false, acceptedFormats: ["PDF"] },
        { id: "mg-7-7", name: "税务合规证明", description: "完税证明及税收优惠适用依据", required: true, acceptedFormats: ["PDF"] },
        { id: "mg-7-8", name: "外汇合规", description: "外汇登记及资金汇出入合规文件", required: false, acceptedFormats: ["PDF"] },
      ]
    },
  ]
};

const financingTemplate: Template = {
  id: "tpl-financing",
  name: "融资尽职调查清单",
  category: "financing",
  description: "适用于企业融资场景的精简尽调清单，聚焦商业模式、财务状况、团队及市场竞争力等投资者关注的核心领域。",
  createdAt: "2025-03-05T10:00:00Z",
  updatedAt: "2025-06-10T16:45:00Z",
  sections: [
    {
      id: "fn-s1", name: "商业模式", order: 1,
      items: [
        { id: "fn-1-1", name: "商业计划书", description: "包含市场分析、盈利模式、发展规划的完整商业计划书", required: true, acceptedFormats: ["PDF", "PPTX"] },
        { id: "fn-1-2", name: "产品/服务说明", description: "核心产品或服务的详细介绍文档", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "fn-1-3", name: "收入模型", description: "各收入来源的定价策略和收入预测", required: true, acceptedFormats: ["PDF", "XLSX"] },
        { id: "fn-1-4", name: "客户案例", description: "代表性客户案例及合作成果", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "fn-1-5", name: "竞品分析", description: "主要竞争对手对比分析", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "fn-1-6", name: "增长数据", description: "用户增长、收入增长等关键增长指标", required: true, acceptedFormats: ["PDF", "XLSX"] },
      ]
    },
    {
      id: "fn-s2", name: "财务状况", order: 2,
      items: [
        { id: "fn-2-1", name: "近两年财务报表", description: "经审计或审阅的近两年财务报表", required: true, acceptedFormats: ["PDF"] },
        { id: "fn-2-2", name: "最新管理账", description: "最近月份的管理报表", required: true, acceptedFormats: ["PDF", "XLSX"] },
        { id: "fn-2-3", name: "现金流预测", description: "未来12个月的现金流预测", required: true, acceptedFormats: ["PDF", "XLSX"] },
        { id: "fn-2-4", name: "融资历史", description: "历史融资轮次、金额及估值信息", required: true, acceptedFormats: ["PDF", "XLSX"] },
        { id: "fn-2-5", name: "资金使用计划", description: "本次融资资金的详细使用计划", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "fn-2-6", name: "银行贷款情况", description: "现有银行贷款及授信额度", required: true, acceptedFormats: ["PDF", "XLSX"] },
      ]
    },
    {
      id: "fn-s3", name: "团队背景", order: 3,
      items: [
        { id: "fn-3-1", name: "创始团队简历", description: "创始人的详细简历及过往成就", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "fn-3-2", name: "核心团队简介", description: "核心管理团队成员背景和职责", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "fn-3-3", name: "组织架构", description: "公司当前组织架构图", required: true, acceptedFormats: ["PDF", "PNG"] },
        { id: "fn-3-4", name: "员工规模及结构", description: "员工总数、各部门人数及招聘计划", required: true, acceptedFormats: ["PDF", "XLSX"] },
        { id: "fn-3-5", name: "股权结构", description: "当前股权结构及期权池设置", required: true, acceptedFormats: ["PDF", "XLSX"] },
        { id: "fn-3-6", name: "顾问及董事", description: "外部顾问和独立董事信息", required: false, acceptedFormats: ["PDF", "DOCX"] },
      ]
    },
    {
      id: "fn-s4", name: "市场竞争", order: 4,
      items: [
        { id: "fn-4-1", name: "市场规模分析", description: "目标市场的规模及增长预测", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "fn-4-2", name: "竞争格局", description: "行业竞争格局及公司竞争地位", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "fn-4-3", name: "核心壁垒", description: "公司的核心竞争力及护城河分析", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "fn-4-4", name: "客户留存数据", description: "客户留存率、复购率等关键指标", required: true, acceptedFormats: ["PDF", "XLSX"] },
        { id: "fn-4-5", name: "合作伙伴", description: "重要战略合作伙伴关系说明", required: false, acceptedFormats: ["PDF", "DOCX"] },
        { id: "fn-4-6", name: "市场推广策略", description: "获客渠道及市场推广计划", required: true, acceptedFormats: ["PDF", "DOCX"] },
      ]
    },
    {
      id: "fn-s5", name: "技术实力", order: 5,
      items: [
        { id: "fn-5-1", name: "技术架构", description: "系统技术架构及选型说明", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "fn-5-2", name: "知识产权清单", description: "专利、软著、商标等知识产权", required: true, acceptedFormats: ["PDF", "XLSX"] },
        { id: "fn-5-3", name: "研发团队", description: "研发团队规模及核心技术骨干", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "fn-5-4", name: "技术指标", description: "系统性能、可用性等关键技术指标", required: true, acceptedFormats: ["PDF", "XLSX"] },
        { id: "fn-5-5", name: "技术路线图", description: "未来技术发展路线图", required: false, acceptedFormats: ["PDF", "DOCX"] },
        { id: "fn-5-6", name: "安全合规", description: "数据安全和隐私保护措施", required: true, acceptedFormats: ["PDF", "DOCX"] },
      ]
    },
    {
      id: "fn-s6", name: "法律合规", order: 6,
      items: [
        { id: "fn-6-1", name: "公司注册文件", description: "营业执照、章程等注册登记文件", required: true, acceptedFormats: ["PDF"] },
        { id: "fn-6-2", name: "投资协议模板", description: "本次融资拟使用的投资协议草案", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "fn-6-3", name: "重大合同", description: "正在履行的重大合同摘要", required: true, acceptedFormats: ["PDF", "XLSX"] },
        { id: "fn-6-4", name: "诉讼风险", description: "未决诉讼及潜在法律风险说明", required: true, acceptedFormats: ["PDF", "DOCX"] },
        { id: "fn-6-5", name: "合规资质", description: "经营所需的行业许可和资质", required: true, acceptedFormats: ["PDF", "JPG"] },
        { id: "fn-6-6", name: "数据合规声明", description: "数据收集和使用的合规声明", required: true, acceptedFormats: ["PDF", "DOCX"] },
      ]
    },
  ]
};

export const defaultTemplates: Template[] = [equityTemplate, mergerTemplate, financingTemplate];

export function getTemplateCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    equity: "股权投资",
    merger: "并购交易",
    financing: "融资",
    custom: "自定义",
  };
  return map[category] || category;
}

export function getTemplateCategoryColor(category: string): string {
  const map: Record<string, string> = {
    equity: "bg-blue-100 text-blue-700",
    merger: "bg-purple-100 text-purple-700",
    financing: "bg-emerald-100 text-emerald-700",
    custom: "bg-gray-100 text-gray-700",
  };
  return map[category] || "bg-gray-100 text-gray-700";
}
