import { Project, Paragraph, Vocabulary } from './db';

/**
 * 《美的历程》读书笔记示例数据
 * 作者：李泽厚
 * 使用知识笔记模板（knowledge-notes）
 */

const KNOWLEDGE_COLORS = [
  '#E2B933', // 金
  '#9BA876', // 绿
  '#CD8D8B', // 红
  '#7996AC', // 蓝
  '#C26D56', // 橙
];

const getRandomColor = () => KNOWLEDGE_COLORS[Math.floor(Math.random() * KNOWLEDGE_COLORS.length)];

export const SAMPLE_BOOK_NOTES: {
  project: Omit<Project, 'id'>;
  paragraphs: (Omit<Paragraph, 'id' | 'projectId'> & { vocabulary: Omit<Vocabulary, 'id' | 'paragraphId'>[] })[];
} = {
  project: {
    title: "《美的历程》读书笔记",
    author: "李泽厚",
    templateId: "knowledge-notes",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
    isSample: true,
    createdAt: Date.now()
  },
  paragraphs: [
    {
      content: "《美的历程》是李泽厚先生的美学代表作，初版于1981年。全书以宏阔的视野，鸟瞰了中国从远古图腾到明清文艺思潮的美学历程，揭示了中国审美意识发展演变的轨迹。这不是一部普通的美学史，而是一部民族心灵的历程，一部通过艺术展现的文化精神史。",
      order: 0,
      vocabulary: [
        {
          word: "美的历程",
          matchPattern: "美学发展,审美意识,艺术史,美学思想",
          explanation: "李泽厚的代表作，是一部关于中国古典艺术和美学的宏观论著。全书以时间为序，分为十章，从远古图腾一直讲到明清文艺思潮，展现了中国美学思想的发展演变。",
          extendedReading: "《美的历程》自1981年初版以来，重版数十次，影响了几代中国读者。它不仅是一部美学史，更是一部中国文化精神的发展史。",
          referenceLink: [
            "https://book.douban.com/subject/1034067/",
            "https://zhuanlan.zhihu.com/p/28298426"
          ],
          relatedConcepts: ["积淀说", "实践美学", "有意味的形式"],
          sourceReference: "序言 P1-10",
          color: KNOWLEDGE_COLORS[0]
        },
        {
          word: "审美意识",
          explanation: "指人们对客观事物或现象的审美属性的认识和评价。李泽厚认为审美意识是历史实践的产物，是时代精神的凝练和积淀。",
          extendedReading: "审美意识的发展是一个历史过程，每个时代都有其独特的审美特征，这些特征反映了当时的社会生活和文化心理。",
          relatedConcepts: ["时代精神", "积淀说"],
          sourceReference: "序言 P5-8",
          color: KNOWLEDGE_COLORS[1]
        }
      ]
    },
    {
      content: "第一章「龙飞凤舞」探讨了远古时期的艺术起源。李泽厚指出，原始艺术不是单纯为了审美，而是与图腾崇拜、巫术仪式紧密相关。那些抽象的几何纹饰，最初都是有具体含义的图腾符号。随着时代的发展，这些具体含义逐渐淡化，只剩下形式的美，这就是「有意味的形式」。",
      order: 1,
      vocabulary: [
        {
          word: "龙飞凤舞",
          explanation: "远古图腾艺术的典型特征。龙和凤是中国古代最重要的图腾符号，它们源于原始部落的图腾崇拜。这些图腾动物往往被赋予了超自然的力量，成为部落的精神象征。",
          extendedReading: "「龙飞凤舞」不仅是一种艺术形式，更是原始人类世界观和宇宙观的体现。龙代表阳刚之力，凤代表阴柔之美，二者的结合体现了中国传统文化中阴阳调和的思想。",
          referenceLink: [
            "https://baike.baidu.com/item/%E7%BE%8E%E7%9A%84%E5%8E%86%E7%A8%8B/2514184"
          ],
          relatedConcepts: ["图腾崇拜", "原始艺术"],
          sourceReference: "第一章 P15-35",
          color: KNOWLEDGE_COLORS[2]
        },
        {
          word: "有意味的形式",
          explanation: "这是李泽厚借鉴英国美学家克莱夫·贝尔的概念。指那些不仅具有形式美，还蕴含着特定社会内容和情感意蕴的艺术形式。在原始艺术中，抽象纹饰最初都是具体的图腾符号。",
          extendedReading: "「有意味的形式」理论揭示了艺术形式与社会内容之间的辩证关系。随着历史发展，「意味」逐渐淡化，形式变得越来越抽象，最终成为纯粹的装饰图案。",
          relatedConcepts: ["抽象艺术", "装饰艺术"],
          sourceReference: "第一章 P30-35",
          color: KNOWLEDGE_COLORS[3]
        },
        {
          word: "图腾崇拜",
          explanation: "原始社会的一种宗教形式，原始部落相信某种动物、植物或自然现象与本部族有血缘关系，将其作为保护神和象征加以崇拜。",
          extendedReading: "图腾崇拜是原始艺术的重要源头。中国的龙、凤、虎等图腾，不仅存在于艺术作品中，更深深植根于中华民族的文化基因中。",
          relatedConcepts: ["巫术仪式", "原始宗教"],
          sourceReference: "第一章 P15-25",
          color: KNOWLEDGE_COLORS[4]
        }
      ]
    },
    {
      content: "第二章「青铜饕餮」展现了商周青铜艺术的独特魅力。那些狰狞可怕的饕餮纹，不是恐怖的象征，而是崇高、威严的体现。它们反映了奴隶社会统治阶级的意志和力量，展现了一种「狞厉的美」。这种美之所以能打动我们，正因为它凝结了巨大的历史力量和情感。",
      order: 2,
      vocabulary: [
        {
          word: "青铜饕餮",
          explanation: "商周青铜器上最常见的兽面纹饰。饕餮是一种神兽，面目狰狞，大眼圆睁，獠牙外露。这种纹饰不仅是装饰，更是权力和威严的象征。",
          extendedReading: "青铜饕餮体现了早期中国「狞厉之美」的美学特征。这种美既恐怖又庄严，既神秘又充满力量，反映了奴隶社会的阶级关系和统治意志。",
          referenceLink: [
            "https://www.bfa.edu.cn/sizhengbu/info/1010/1106.htm"
          ],
          relatedConcepts: ["狞厉的美", "线的艺术"],
          sourceReference: "第二章 P40-60",
          color: KNOWLEDGE_COLORS[0]
        },
        {
          word: "狞厉的美",
          explanation: "李泽厚对商周青铜艺术美学特征的概括。这种美以恐怖、威严为特征，却能给人以震撼和崇高感。它体现了巨大的历史力量和情感积淀。",
          extendedReading: "「狞厉的美」是中国美学的重要范畴。它不同于温柔和谐之美，而是以冲突、对抗、征服为特征，展现了原始生命力和历史意志的强力。",
          relatedConcepts: ["崇高美", "力量美学"],
          sourceReference: "第二章 P45-50",
          color: KNOWLEDGE_COLORS[1]
        },
        {
          word: "线的艺术",
          explanation: "指青铜器上的纹饰线条艺术。从早期的粗犷豪放到后期的精致流畅，青铜纹饰的线条演变反映了中国艺术从实用向审美的发展过程。",
          extendedReading: "中国艺术是「线的艺术」这一特点深深影响了后世的书法、绘画等艺术形式。线条不仅具有造型功能，更具有独立的审美价值。",
          relatedConcepts: ["书法艺术", "国画"],
          sourceReference: "第二章 P55-60",
          color: KNOWLEDGE_COLORS[2]
        }
      ]
    },
    {
      content: "第三章「先秦理性精神」分析了儒道互补的中国文化心理结构。儒家强调艺术的社会功能，注重「文以载道」；道家追求自然无为，推崇「大音希声」。这两种看似对立的美学思想，实际上形成了互补，共同塑造了中国人的审美趣味。",
      order: 3,
      vocabulary: [
        {
          word: "儒道互补",
          explanation: "中国传统文化的核心结构。儒家积极入世，强调社会秩序和伦理道德；道家超然出世，追求自然逍遥。两种思想在艺术领域相互补充，形成了独特的美学传统。",
          extendedReading: "儒道互补不仅体现在哲学思想上，更深刻影响了中国艺术的发展。儒家艺术的「载道」传统与道家艺术的「写意」精神，共同构成了中国美学的双重维度。",
          referenceLink: [
            "https://zhuanlan.zhihu.com/p/574424898"
          ],
          relatedConcepts: ["赋比兴", "比德思想"],
          sourceReference: "第三章 P65-85",
          color: KNOWLEDGE_COLORS[3]
        },
        {
          word: "赋比兴",
          explanation: "中国古典诗歌的三种表现手法。「赋」是直接铺陈，「比」是比喻，「兴」是托物起兴。这三种手法体现了中国诗歌独特的审美特征。",
          extendedReading: "「赋比兴」不仅是一种诗歌技巧，更是一种思维方式。它强调通过具体意象传达普遍情感，体现了中国美学「情景交融」的特点。",
          relatedConcepts: ["意象理论", "抒情传统"],
          sourceReference: "第三章 P80-85",
          color: KNOWLEDGE_COLORS[4]
        }
      ]
    },
    {
      content: "第五章「魏晋风度」描述了一个人的「自觉」时代。魏晋时期，战乱频繁，士人开始转向内心世界的探索，形成了独特的审美追求：强调「气韵生动」，追求「神韵」，推崇「潇洒」。这种对个体精神自由的追求，深深影响了后世的文人画和书法艺术。",
      order: 4,
      vocabulary: [
        {
          word: "魏晋风度",
          explanation: "魏晋时期士人阶层特有的精神气质和审美趣味。特点是追求精神自由、个性解放，崇尚自然、超然物外，重视情感的真挚表达。",
          extendedReading: "魏晋风度是中国美学史上的重要转折点。它标志着中国美学从群体本位转向个体本位，从功利转向审美，从外在规范转向内在精神。",
          referenceLink: [
            "https://book.douban.com/annotation/15983402/"
          ],
          relatedConcepts: ["气韵生动", "竹林七贤"],
          sourceReference: "第五章 P120-145",
          color: KNOWLEDGE_COLORS[0]
        },
        {
          word: "气韵生动",
          explanation: "谢赫「六法论」中的第一法，也是最高标准。指艺术作品要充满内在生命力和精神气质，不能只追求形似，更要达到神似。",
          extendedReading: "「气韵生动」确立了中国艺术评价的基本标准。它要求艺术家超越具体形象，把握对象的内在精神和生命本质。",
          relatedConcepts: ["神似", "写意"],
          sourceReference: "第五章 P130-135",
          color: KNOWLEDGE_COLORS[1]
        },
        {
          word: "人的自觉",
          explanation: "魏晋时期的重要思想特征。指个体开始认识到自我存在的价值和意义，开始关注内心世界的丰富性和独特性。",
          extendedReading: "「人的自觉」是中国思想史上的重大突破。它推动了艺术从功利目的向审美目的的转变，促进了书法、绘画等艺术的独立发展。",
          relatedConcepts: ["玄学", "名教自然"],
          sourceReference: "第五章 P125-130",
          color: KNOWLEDGE_COLORS[2]
        }
      ]
    },
    {
      content: "第七章「盛唐之音」展现了大唐盛世的艺术繁荣。无论是张旭怀素的狂草，还是李白的诗歌，都充满了豪迈奔放的气势。这是一种乐观自信、自由昂扬的时代精神，体现了盛唐帝国的强大国力和文化自信。",
      order: 5,
      vocabulary: [
        {
          word: "盛唐之音",
          explanation: "指盛唐时期的艺术风格和审美趣味。特点是豪放、雄浑、壮丽，充满了昂扬向上的时代精神和强大的生命力。",
          extendedReading: "盛唐之音是中国美学的巅峰之一。它不仅体现在文学艺术上，更体现在整个时代的文化精神上。开放、包容、自信，这些正是盛唐艺术魅力的源泉。",
          referenceLink: [
            "https://zhuanlan.zhihu.com/p/352216493"
          ],
          relatedConcepts: ["狂草", "盛唐气象"],
          sourceReference: "第七章 P180-200",
          color: KNOWLEDGE_COLORS[3]
        },
        {
          word: "狂草",
          explanation: "草书的极致形式，以张旭、怀素为代表。其特点是笔势狂放、结构奇特、充满动感，打破了传统书法的规范，达到了「无法而法」的艺术境界。",
          extendedReading: "狂草是中国书法艺术的最高表现形式之一。它完全超越了实用功能，成为一种纯粹的情感表达和艺术创造。",
          relatedConcepts: ["书法艺术", "抽象美"],
          sourceReference: "第七章 P185-190",
          color: KNOWLEDGE_COLORS[4]
        },
        {
          word: "盛唐气象",
          explanation: "盛唐时期特有的文化风貌和精神气象。表现为开放包容、自信昂扬、雄浑豪迈，是唐代国力强盛、文化繁荣在艺术领域的反映。",
          extendedReading: "盛唐气象不仅体现在文学艺术上，更体现在社会生活的方方面面。它是中国古代文化最辉煌时期的象征。",
          relatedConcepts: ["文化自信", "时代精神"],
          sourceReference: "第七章 P180-185",
          color: KNOWLEDGE_COLORS[0]
        }
      ]
    },
    {
      content: "第九章「宋元山水意境」探讨了中国山水画的独特美学追求。宋人讲求「格物致知」，追求真实的自然再现；元人追求「逸品」，强调主观情感的表达。从「无我之境」到「有我之境」，中国山水画完成了一次深刻的美学转型。",
      order: 6,
      vocabulary: [
        {
          word: "宋元山水意境",
          explanation: "宋元时期山水画的审美追求。宋代山水注重真实再现，讲究「格物致知」；元代山水强调主观表达，追求「逸品」趣味。",
          extendedReading: "宋元山水是中国绘画艺术的巅峰。它不仅是一种艺术形式，更是一种哲学思考和人生境界的体现。",
          referenceLink: [
            "https://blog.sina.com.cn/s/blog_17fa351a30102yo4d.html"
          ],
          relatedConcepts: ["无我之境", "有我之境"],
          sourceReference: "第九章 P230-255",
          color: KNOWLEDGE_COLORS[1]
        },
        {
          word: "无我之境",
          explanation: "王国维在《人间词话》中提出的概念。指艺术作品完全融入对象，没有主观情感的直接抒发，达到「物我两忘」的境界。宋代山水多属此类。",
          extendedReading: "「无我之境」不是没有「我」，而是「我」已经完全消融在对象中，达到了主客统一的境界。这是中国美学的最高追求之一。",
          relatedConcepts: ["有我之境", "物我两忘"],
          sourceReference: "第九章 P240-245",
          color: KNOWLEDGE_COLORS[2]
        },
        {
          word: "有我之境",
          explanation: "王国维提出的概念，指艺术作品中明显融入了作者的主观情感。元代山水画多属此类，强调主观情感的表达和个性特征的呈现。",
          extendedReading: "从「无我之境」到「有我之境」，反映了中国美学从客观再现向主观表现的转变，体现了个体意识的觉醒。",
          relatedConcepts: ["文人画", "写意画"],
          sourceReference: "第九章 P245-250",
          color: KNOWLEDGE_COLORS[3]
        }
      ]
    },
    {
      content: "第十章「明清文艺思潮」分析了市民文艺的兴起和浪漫洪流的涌现。《红楼梦》《牡丹亭》等作品，展现了个体情感的觉醒和对封建礼教的反抗。这种感伤文学的审美追求，预示了中国社会的深刻变革和现代性的萌芽。",
      order: 7,
      vocabulary: [
        {
          word: "市民文艺",
          explanation: "明清时期兴起的、反映市民阶层审美趣味和思想感情的文艺形式。包括话本小说、戏曲等，特点是通俗、生动、贴近生活。",
          extendedReading: "市民文艺的兴起是中国艺术史上的重大转变。它标志着艺术从精英文化向大众文化的扩展，推动了审美观念的民主化进程。",
          referenceLink: [
            "https://zhuanlan.zhihu.com/p/430233303"
          ],
          relatedConcepts: ["话本小说", "戏曲艺术"],
          sourceReference: "第十章 P260-280",
          color: KNOWLEDGE_COLORS[4]
        },
        {
          word: "感伤文学",
          explanation: "明清时期的一种文学思潮，以《红楼梦》《桃花扇》等为代表。特点是充满忧患意识和人生感慨，反映了对社会现实的深刻批判和对人生意义的追问。",
          extendedReading: "感伤文学是封建社会衰落期的精神产物。它既是对旧制度的批判，也是对理想世界的憧憬，体现了中国文学的现代性萌芽。",
          relatedConcepts: ["浪漫洪流", "批判现实主义"],
          sourceReference: "第十章 P270-275",
          color: KNOWLEDGE_COLORS[0]
        },
        {
          word: "浪漫洪流",
          explanation: "李泽厚对明清文艺思潮的概括。指以《牡丹亭》《长生殿》为代表的、追求个性解放和情感自由的艺术潮流。",
          extendedReading: "明清浪漫洪流是对程朱理学的反拨，它强调「情」的价值，追求个体情感的自由表达，为中国近代的启蒙思想奠定了基础。",
          relatedConcepts: ["个性解放", "情教"],
          sourceReference: "第十章 P265-270",
          color: KNOWLEDGE_COLORS[1]
        }
      ]
    },
    {
      content: "《美的历程》的核心理念是「积淀说」。李泽厚认为，艺术形式是人类历史实践的「积淀」，那些看起来纯粹的审美形式，实际上包含着深厚的社会历史内容。时代精神的火花在这里凝冻下来，传留和感染着人们的思想情感。",
      order: 8,
      vocabulary: [
        {
          word: "积淀说",
          explanation: "李泽厚美学的核心概念。指人类在漫长的历史实践中，将社会内容、情感意蕴逐渐积淀在艺术形式中，使形式成为具有「意味」的审美对象。",
          extendedReading: "「积淀说」揭示了形式与内容的辩证关系。任何艺术形式都不是偶然的，而是历史实践的产物，蕴含着深厚的文化心理结构。",
          referenceLink: [
            "https://www.cssn.cn/skgj/skgj_bk/201412/t20141228_4627254.shtml"
          ],
          relatedConcepts: ["文化心理结构", "时代精神"],
          sourceReference: "全书 P1-10",
          color: KNOWLEDGE_COLORS[2]
        },
        {
          word: "实践美学",
          explanation: "李泽厚美学思想的基本立场。强调从人类社会实践出发解释美的本质和起源，认为美是实践的产物，是自然的人化和人的对象化的统一。",
          extendedReading: "实践美学是中国当代美学的重要流派，它超越了主观美学和客观美学的对立，为理解美的本质提供了新的视角。",
          relatedConcepts: ["自然的人化", "对象化"],
          sourceReference: "全书 P3-8",
          color: KNOWLEDGE_COLORS[3]
        },
        {
          word: "文化心理结构",
          explanation: "指在长期历史实践中形成的、相对稳定的民族心理结构和思维模式。它是艺术形式得以产生和被理解的基础。",
          extendedReading: "中国独特的文化心理结构，决定了中国艺术的独特审美特征。理解这种结构，是理解中国美学的关键。",
          relatedConcepts: ["民族精神", "集体无意识"],
          sourceReference: "全书 P8-10",
          color: KNOWLEDGE_COLORS[4]
        }
      ]
    }
  ]
};
