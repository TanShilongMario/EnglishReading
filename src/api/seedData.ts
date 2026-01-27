import { Project, Paragraph, Vocabulary } from './db';

const HIGHLIGHT_COLORS = [
  '#E2B933', // Luxury Gold
  '#C0392B', // Deep Red
  '#2980B9', // Belize Blue
  '#27AE60', // Nephritis Green
  '#8E44AD'  // Wisteria Purple
];

const getRandomColor = () => HIGHLIGHT_COLORS[Math.floor(Math.random() * HIGHLIGHT_COLORS.length)];

export const SAMPLE_PROJECT: {
  project: Omit<Project, 'id'>;
  paragraphs: (Omit<Paragraph, 'id' | 'projectId'> & { vocabulary: Omit<Vocabulary, 'id' | 'paragraphId'>[] })[];
} = {
  project: {
    title: "How to Articulate Yourself Intelligently (Sample)",
    coverImage: "https://s3.bmp.ovh/2026/01/27/XAruPv4g.png",
    isSample: true,
    createdAt: Date.now()
  },
  paragraphs: [
    {
      content: "When I was young, I was always drawn to people who sounded intelligent. People like Alan Watts or Jordan Peterson who could explain deep ideas in an interesting way. Most of the time, I didn’t understand what they were saying, but since it sounded smart and articulate, I listened anyway and gave them my respect.",
      order: 0,
      image: "https://s3.bmp.ovh/2026/01/27/l3csYi7H.png",
      vocabulary: [
        {
          word: "articulate",
          phonetic: "/ɑːrˈtɪkjuleɪt/",
          partOfSpeech: "v.",
          definition: "To express ideas clearly and effectively.",
          translation: "清楚地表达",
          matchPattern: "articulated, articulates, articulating",
          examples: ["She is an articulate speaker who can convince anyone."],
          color: HIGHLIGHT_COLORS[0]
        },
        {
          word: "intelligent",
          phonetic: "/ɪnˈtelɪdʒənt/",
          partOfSpeech: "adj.",
          definition: "Showing symbols of high mental capacity.",
          translation: "聪明的，有才智的",
          image: "https://s3.bmp.ovh/2026/01/27/EnAvN9YH.png",
          examples: ["It was an intelligent solution to a complex problem."],
          color: HIGHLIGHT_COLORS[1]
        },
        {
          word: "drawn to",
          phonetic: "/drɔːn tuː/",
          partOfSpeech: "phrase",
          definition: "To be attracted to something or someone.",
          translation: "被...吸引",
          examples: ["Many young artists are drawn to the vibrant city life."],
          color: HIGHLIGHT_COLORS[2]
        }
      ]
    },
    {
      content: "I never thought I could do the same. I just didn’t think my brain had the capacity to do that. Being good at taking tests is a much different skill than stringing together coherent thoughts about big problems and articulating them to someone else.",
      order: 1,
      vocabulary: [
        {
          word: "capacity",
          phonetic: "/kəˈpæsəti/",
          partOfSpeech: "n.",
          definition: "The maximum amount that something can contain or produce.",
          translation: "容量，能力",
          examples: ["The stadium has a seating capacity of 50,000."],
          color: HIGHLIGHT_COLORS[3]
        },
        {
          word: "coherent",
          phonetic: "/koʊˈhɪərənt/",
          partOfSpeech: "adj.",
          definition: "Logical and consistent.",
          translation: "连贯的，条理清晰的",
          examples: ["He failed to provide a coherent explanation for his absence."],
          color: HIGHLIGHT_COLORS[4]
        },
        {
          word: "string together",
          phonetic: "/strɪŋ təˈɡeðər/",
          partOfSpeech: "phrase",
          definition: "To combine things into a connected whole.",
          translation: "串联，拼凑",
          examples: ["She managed to string together a few sentences in French."],
          color: HIGHLIGHT_COLORS[0]
        }
      ]
    },
    {
      content: "Over a decade later, without really trying to become articulate... my job, as a writer and self-proclaimed internet micro celebrity, is to articulate ideas in a useful or impactful way. Millions of people have chosen to read my thoughts on a screen over the past 6 years.",
      order: 2,
      vocabulary: [
        {
          word: "self-proclaimed",
          phonetic: "/ˌself prəˈkleɪmd/",
          partOfSpeech: "adj.",
          definition: "Described as a particular thing by oneself.",
          translation: "自封的",
          examples: ["The self-proclaimed expert had little actual experience."],
          color: HIGHLIGHT_COLORS[1]
        },
        {
          word: "impactful",
          phonetic: "/ɪmˈpæktfl/",
          partOfSpeech: "adj.",
          definition: "Having a major impact or effect.",
          translation: "有影响力的",
          examples: ["The speech was deeply impactful and moved the audience to tears."],
          color: HIGHLIGHT_COLORS[2]
        }
      ]
    },
    {
      content: "First, we need to build our inner album of greatest hits. If you want to articulate yourself intelligently, you need a pool of 8-10 of your biggest ideas that can be connected to almost any topic. Then, when it’s time to speak, you have a starting point that you’ve already thought through hundreds of times before.",
      order: 3,
      vocabulary: [
        {
          word: "inner album",
          phonetic: "/ˈɪnər ˈælbəm/",
          partOfSpeech: "n.",
          definition: "A collection of personal core ideas.",
          translation: "内在专辑（核心观点集）",
          examples: ["Every great speaker has an inner album of concepts they know by heart."],
          color: HIGHLIGHT_COLORS[3]
        },
        {
          word: "greatest hits",
          phonetic: "/ˈɡreɪtɪst hɪts/",
          partOfSpeech: "phrase",
          definition: "The most successful or popular examples of someone's work.",
          translation: "最成功的作品（成名曲）",
          examples: ["The author decided to revisit his greatest hits in the new collection."],
          color: HIGHLIGHT_COLORS[4]
        }
      ]
    },
    {
      content: "But that’s my biggest mental hurdle... I don’t want to sound like I’m repeating myself. But look at your favorite musician. Most of their music sounds the same with slight variations. By nature, you must repeat yourself, because the most important ideas deserve to be repeated and refined.",
      order: 4,
      vocabulary: [
        {
          word: "hurdle",
          phonetic: "/ˈhɜːrdl/",
          partOfSpeech: "n.",
          definition: "An obstacle or difficulty to be overcome.",
          translation: "障碍，门槛",
          examples: ["The first hurdle is always the hardest to get over."],
          color: HIGHLIGHT_COLORS[0]
        },
        {
          word: "refine",
          phonetic: "/rɪˈfaɪn/",
          partOfSpeech: "v.",
          definition: "To improve something by making small changes.",
          translation: "完善，提炼",
          matchPattern: "refined, refines, refining",
          examples: ["The architect continued to refine the design until it was perfect."],
          color: HIGHLIGHT_COLORS[1]
        }
      ]
    },
    {
      content: "If you want to become articulate, you should probably start writing. Writing is putting the pieces of a puzzle together. I’ve put together 3 frameworks that will help you blow past everyone else who starts without a plan.",
      order: 5,
      vocabulary: [
        {
          word: "framework",
          phonetic: "/ˈfreɪmwɜːrk/",
          partOfSpeech: "n.",
          definition: "A basic structure underlying a system or concept.",
          translation: "框架，构架",
          matchPattern: "frameworks",
          examples: ["The government is establishing a framework for economic growth."],
          color: HIGHLIGHT_COLORS[2]
        },
        {
          word: "blow past",
          phonetic: "/bloʊ pæst/",
          partOfSpeech: "phrase",
          definition: "To move past someone or something very quickly.",
          translation: "迅速超越",
          examples: ["Technology is blowing past our traditional laws and regulations."],
          color: HIGHLIGHT_COLORS[3]
        }
      ]
    },
    {
      content: "Beginner – The Micro Story.\nThe foundation of a story is transformation.\nProblem – state a relatable problem.\nAmplify – illustrate how that problem leads to a negative outcome.\nSolution – state the solution to the problem.",
      order: 6,
      vocabulary: [
        {
          word: "transformation",
          phonetic: "/ˌtrænsfərˈmeɪʃn/",
          partOfSpeech: "n.",
          definition: "A thorough or dramatic change in form or appearance.",
          translation: "转变，转化",
          examples: ["The landscape underwent a radical transformation."],
          color: HIGHLIGHT_COLORS[4]
        },
        {
          word: "relatable",
          phonetic: "/rɪˈleɪtəbl/",
          partOfSpeech: "adj.",
          definition: "Enabling a person to feel that they can relate to someone or something.",
          translation: "能引起共鸣的",
          examples: ["She writes about relatable situations that everyone experiences."],
          color: HIGHLIGHT_COLORS[0]
        },
        {
          word: "amplify",
          phonetic: "/ˈæmplɪfaɪ/",
          partOfSpeech: "v.",
          definition: "To make something more intense or far-reaching.",
          translation: "放大，增强",
          examples: ["We need to amplify the voices of the marginalized."],
          color: HIGHLIGHT_COLORS[1]
        }
      ]
    },
    {
      content: "If you don't have an idea, you need to hunt for them. Go down rabbit holes on a topic, listen to a new podcast, or just sit with your thoughts until you reach a compelling insight. Then jot it down so you don’t lose it.",
      order: 7,
      vocabulary: [
        {
          word: "rabbit hole",
          phonetic: "/ˈræbɪt hoʊl/",
          partOfSpeech: "phrase",
          definition: "A complex or time-consuming situation or topic.",
          translation: "钻研，深挖",
          examples: ["I went down a rabbit hole researching my family history."],
          color: HIGHLIGHT_COLORS[2]
        },
        {
          word: "insight",
          phonetic: "/ˈɪnsaɪt/",
          partOfSpeech: "n.",
          definition: "A deep understanding of a person or thing.",
          translation: "洞察力，见解",
          examples: ["The study offers new insights into how children learn languages."],
          color: HIGHLIGHT_COLORS[3]
        },
        {
          word: "jot down",
          phonetic: "/dʒɑːt daʊn/",
          partOfSpeech: "v.",
          definition: "To write something quickly.",
          translation: "草草记下",
          examples: ["Wait a minute, let me jot down your phone number."],
          color: HIGHLIGHT_COLORS[4]
        }
      ]
    },
    {
      content: "Intermediate – The Pyramid Principle.\nStart with the main idea, support it with key arguments, then provide detailed evidence. Unlike most content that waits to give you the answer, this takes an answer-first approach.",
      order: 8,
      vocabulary: [
        {
          word: "pyramid",
          phonetic: "/ˈpɪrəmɪd/",
          partOfSpeech: "n.",
          definition: "A structure with a square base and four sloping triangular sides.",
          translation: "金字塔",
          examples: ["The ancient pyramids of Egypt are wonders of the world."],
          color: HIGHLIGHT_COLORS[0]
        },
        {
          word: "evidence",
          phonetic: "/ˈevɪdəns/",
          partOfSpeech: "n.",
          definition: "Facts or information indicating whether a belief is true.",
          translation: "证据，证明",
          examples: ["There is no evidence to suggest that he was involved in the crime."],
          color: HIGHLIGHT_COLORS[1]
        }
      ]
    },
    {
      content: "Advanced – Cross Domain Synthesis.\nNote patterns or concepts from your other interests that help support your argument. For example, using the concept of entropy from physics to illustrate how distraction works in deep work.",
      order: 9,
      vocabulary: [
        {
          word: "synthesis",
          phonetic: "/ˈsɪnθəsɪs/",
          partOfSpeech: "n.",
          definition: "The combination of components or elements to form a connected whole.",
          translation: "综合，合成",
          examples: ["Her work is a synthesis of many different artistic styles."],
          color: HIGHLIGHT_COLORS[2]
        },
        {
          word: "entropy",
          phonetic: "/ˈentrəpi/",
          partOfSpeech: "n.",
          definition: "A thermodynamic quantity representing the unavailability of a system's thermal energy.",
          translation: "熵（此处指无序状态）",
          examples: ["In a closed system, entropy always increases over time."],
          color: HIGHLIGHT_COLORS[3]
        }
      ]
    },
    {
      content: "Writing is like legos with ideas. Here are a few easy ones to brainstorming what to write next: Pain point, Example, Personal story, Statistic, Metaphor, and Quotes. Quotes are easy because they are almost always great ideas.",
      order: 10,
      vocabulary: [
        {
          word: "brainstorming",
          phonetic: "/ˈbreɪnstɔːrmɪŋ/",
          partOfSpeech: "v.",
          definition: "Produce an idea or way of solving a problem by rapid thinking.",
          translation: "集思广益，头脑风暴",
          examples: ["The team spent the afternoon brainstorming new product ideas."],
          color: HIGHLIGHT_COLORS[4]
        },
        {
          word: "metaphor",
          phonetic: "/ˈmetəfər/",
          partOfSpeech: "n.",
          definition: "A figure of speech in which a word or phrase is applied to an object or action.",
          translation: "隐喻，比喻",
          examples: ["'Life is a journey' is a common metaphor."],
          color: HIGHLIGHT_COLORS[0]
        }
      ]
    },
    {
      content: "These are the “legos” that compose most of my outlines. Once you get the hang of it, it becomes second nature, and your thinking process starts to rewire. I hope that was helpful enough to get you started.",
      order: 11,
      vocabulary: [
        {
          word: "get the hang of",
          phonetic: "/ɡet ðə hæŋ əv/",
          partOfSpeech: "phrase",
          definition: "To learn how to do or use something.",
          translation: "掌握窍门",
          examples: ["It took me a while to get the hang of using the new software."],
          color: HIGHLIGHT_COLORS[1]
        },
        {
          word: "rewire",
          phonetic: "/ˌriːˈwaɪər/",
          partOfSpeech: "v.",
          definition: "To change the way a system or a brain works.",
          translation: "重构，重新连接",
          examples: ["Learning a new language can help rewire your brain."],
          color: HIGHLIGHT_COLORS[2]
        }
      ]
    }
  ]
};
