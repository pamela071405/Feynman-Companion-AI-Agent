export const MOCK_FOLLOW_UP = {
  code: 200,
  msg: 'success',
  data: {
    next_action: 'follow_up',
    reply_text:
      '确实如此！那除了边权不能为负数，你能不能解释一下，为什么没访问过的节点里，当前距离最小的那个点，它的最短路径就确定了呢？',
    card_preview: null,
    final_report: null
  }
}

export const MOCK_GENERATE_REPORT = {
  code: 200,
  msg: 'success',
  data: {
    next_action: 'generate_report',
    reply_text:
      '今天的对练结束，这是你的诊断报告：',
    card_preview: {
      total_score: 34,
      summary: '对核心机制掌握扎实，表达清晰有条理'
    },
    final_report: {
      dimensions: [
        {
          name: '理解深度',
          score: 9,
          analysis: '对贪心策略的核心机制理解到位，但在证明其正确性时缺乏系统性推导',
          suggestion: '建议通过反证法理解：假设存在更短路径会与非负权前提矛盾'
        },
        {
          name: '表达完整性',
          score: 8,
          analysis: '覆盖了核心流程，但遗漏了非负权前提的重要性说明',
          suggestion: '讲解时明确指出适用范围，强调负权边会破坏算法正确性'
        },
        {
          name: '逻辑连贯性',
          score: 8,
          analysis: '步骤描述清晰，但各步骤间的逻辑衔接不够自然',
          suggestion: '尝试用"因为...所以..."的句式串联每个操作步骤'
        },
        {
          name: '结构化能力',
          score: 9,
          analysis: '讲解层次分明，能够分点阐述核心概念',
          suggestion: '可以进一步使用对比方式突出算法特点与局限'
        }
      ],
      overall_comment:
        '整体表现优秀！你对 Dijkstra 算法的核心机制掌握扎实，表达清晰有条理。主要提升点在于贪心策略正确性的证明逻辑，建议通过反证法深入理解非负权前提的必要性。继续保持，相信下次会更出色！'
    }
  }
}

export const MOCK_GREETING = {
  code: 200,
  msg: 'success',
  data: {
    next_action: 'follow_up',
    reply_text:
      '同学你好！请用大白话向我解释一下，Dijkstra 算法是怎么保证一定能找到最短路径的？',
    card_preview: null,
    final_report: null,
    kp_id: 'kp-demo',
    kp_name: 'Dijkstra 算法'
  }
}

export const MOCK_MATERIAL_STATUS_DONE = {
  code: 200,
  msg: 'success',
  data: {
    material_id: 'mat-demo',
    status: 'done',
    step: '完成',
    progress: 1,
    error: null
  }
}

export const MOCK_MATERIAL_STATUS_GENERATING = {
  code: 200,
  msg: 'success',
  data: {
    material_id: 'mat-generating',
    status: 'generating',
    step: 'rubric 生成中',
    progress: 0.6,
    error: null
  }
}

export const MOCK_MATERIAL_STATUS_FAILED = {
  code: 200,
  msg: 'success',
  data: {
    material_id: 'mat-failed',
    status: 'failed',
    step: '解析失败',
    progress: 0,
    error: '教材目录无法识别，请换有目录的 PDF'
  }
}

export const MOCK_KNOWLEDGE_TREE = {
  code: 200,
  msg: 'success',
  data: [
    {
      material_id: 'mat-demo',
      title: '数据结构教材',
      chapters: [
        {
          chapter_id: 'ch-demo',
          title: '第6章 图论',
          knowledge_points: [
            {
              kp_id: 'kp-demo',
              name: 'Dijkstra 算法',
              summary: '非负权图求单源最短路径的贪心算法',
              page_start: 30,
              page_end: 33,
              status: 'done'
            },
            {
              kp_id: 'kp-mst',
              name: '最小生成树',
              summary: '连通图总权值最小的生成子图',
              page_start: 34,
              page_end: 38,
              status: 'done'
            },
            {
              kp_id: 'kp-topo',
              name: '拓扑排序',
              summary: '有向无环图节点线性排序方式',
              page_start: 39,
              page_end: 42,
              status: 'done'
            }
          ]
        },
        {
          chapter_id: 'ch-tree',
          title: '第5章 树结构',
          knowledge_points: []
        }
      ]
    },
    {
      material_id: 'mat-os',
      title: '操作系统教材',
      chapters: []
    }
  ]
}

export const MOCK_KP_DETAIL = {
  code: 200,
  msg: 'success',
  data: {
    kp_id: 'kp-demo',
    name: 'Dijkstra 算法',
    summary: '非负权图求单源最短路径的贪心算法',
    rubric: {
      concept_prerequisite: {
        name: '概念前提',
        content: 'Dijkstra算法适用于边权非负的带权图。负权边会破坏已访问节点最短路径已确定这一核心结论。'
      },
      core_mechanism: {
        name: '核心机制',
        content: '基于贪心：每次从未访问节点中选距离起点最近的，标记为已访问，并用它松弛相邻节点。'
      },
      principle_proof: {
        name: '原理证明',
        content: '正确性依赖非负权前提：当前距离最小的未访问节点之后不可能再通过其他未访问节点得到更短路径。'
      },
      common_misunderstandings: {
        name: '常见误区',
        content: [
          '认为Dijkstra可以处理负权图',
          '只记步骤无法解释贪心策略正确性',
          '混淆松弛操作的作用',
          '误以为每次选的是边权最小的边'
        ]
      }
    },
    page_start: 30,
    page_end: 33,
    status: 'done',
    source_chunks: [
      { chunk_id: 'chunk-1', page: 30, text: 'Dijkstra算法用于求解...' },
      { chunk_id: 'chunk-2', page: 31, text: '贪心策略：每次选择...' },
      { chunk_id: 'chunk-3', page: 32, text: '松弛操作：用当前节点更新相邻节点距离...' },
      { chunk_id: 'chunk-4', page: 33, text: '正确性依赖边权非负...' }
    ]
  }
}

export const MOCK_GREETING_DYNAMIC = {
  code: 200,
  msg: 'success',
  data: {
    reply_text: '请你向我讲解一下 Dijkstra 算法的核心原理，讲得越详细越好。',
    kp_id: 'kp-demo',
    kp_name: 'Dijkstra 算法'
  }
}

export const MOCK_KP_CREATE = {
  code: 200,
  msg: 'success',
  data: {
    kp_id: 'kp-mock-new',
    status: 'pending_regenerate'
  }
}

export const MOCK_KP_UPDATE = {
  code: 200,
  msg: 'success',
  data: {
    kp_id: 'kp-demo',
    regenerate_triggered: true,
    status: 'pending_regenerate'
  }
}

export const MOCK_KP_DELETE = {
  code: 200,
  msg: 'success',
  data: {
    kp_id: 'kp-demo',
    deleted: true
  }
}

export const MOCK_KP_REGENERATE = {
  code: 200,
  msg: 'success',
  data: {
    kp_id: 'kp-demo',
    status: 'pending_regenerate'
  }
}