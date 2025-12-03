
import { ProblemDef, ProblemId, TokenExplanation } from './types';

export const TOKEN_EXPLANATIONS: Record<string, TokenExplanation> = {
  '#': { title: { en: 'Preprocessor Directive', cn: '预处理指令' }, desc: { en: 'Tells the computer to do something before compiling.', cn: '告诉电脑在编译代码之前先做一些准备工作。' } },
  'include': { title: { en: 'Include', cn: '包含' }, desc: { en: 'Imports a library or toolset.', cn: '引入一个工具包，就像你上课前要拿课本一样。' } },
  '<': { title: { en: 'Angle Bracket', cn: '尖括号' }, desc: { en: 'Wraps the name of the library.', cn: '包裹住工具包的名字。' } },
  '>': { title: { en: 'Angle Bracket', cn: '尖括号' }, desc: { en: 'Wraps the name of the library.', cn: '包裹住工具包的名字。' } },
  'iostream': { title: { en: 'Input/Output Stream', cn: '输入输出流' }, desc: { en: 'The standard library for printing text to screen.', cn: '这是一个标准工具箱，让我们能把字显示在屏幕上，或者从键盘读入数据。' } },
  'using': { title: { en: 'Using', cn: '使用' }, desc: { en: 'Declares we are using a namespace.', cn: '声明我们要使用某一套命名规则。' } },
  'namespace': { title: { en: 'Namespace', cn: '命名空间' }, desc: { en: 'A container for names to avoid conflicts.', cn: '像是给变量贴标签的“姓氏”，防止名字冲突。' } },
  'std': { title: { en: 'Standard', cn: '标准 (Standard)' }, desc: { en: 'The standard C++ namespace.', cn: 'C++的标准命名空间，里面的工具都是官方认证的。' } },
  ';': { title: { en: 'Semicolon', cn: '分号' }, desc: { en: 'End of a statement.', cn: '表示一句话讲完了。就像句号一样重要！' } },
  'int': { title: { en: 'Integer', cn: '整数 (Integer)' }, desc: { en: 'A box type that holds whole numbers.', cn: '一种专门装整数（没有小数点）的盒子类型。' } },
  'main': { title: { en: 'Main Function', cn: '主函数' }, desc: { en: 'The entry point of the program.', cn: '程序的入口。电脑运行程序时，第一件事就是找它。' } },
  '(': { title: { en: 'Parenthesis', cn: '小括号' }, desc: { en: 'Used for function parameters.', cn: '用来放函数的参数，或者调整运算优先级。' } },
  ')': { title: { en: 'Parenthesis', cn: '小括号' }, desc: { en: 'Used for function parameters.', cn: '用来放函数的参数，或者调整运算优先级。' } },
  '{': { title: { en: 'Curly Brace', cn: '大括号' }, desc: { en: 'Starts a block of code.', cn: '代码块的开始。就像房子的门打开了。' } },
  '}': { title: { en: 'Curly Brace', cn: '大括号' }, desc: { en: 'Ends a block of code.', cn: '代码块的结束。就像房子的门关上了。' } },
  'return': { title: { en: 'Return', cn: '返回' }, desc: { en: 'Exits the function and sends back a value.', cn: '结束函数，并交回一个结果。' } },
  '0': { title: { en: 'Zero', cn: '零' }, desc: { en: 'Standard success code.', cn: '在主函数里，返回0通常代表“程序成功运行，没有出错”。' } },
  '=': { title: { en: 'Assignment', cn: '赋值' }, desc: { en: 'Puts the value on the right into the variable on the left.', cn: '把右边的东西，放进左边的盒子里。' } },
  'if': { title: { en: 'If', cn: '如果' }, desc: { en: 'A conditional check.', cn: '如果条件是真的，就执行后面的代码。' } },
  'swap': { title: { en: 'Swap', cn: '交换' }, desc: { en: 'A function to exchange values.', cn: '交换两个变量的值。' } },
  '//': { title: { en: 'Comment', cn: '注释' }, desc: { en: 'Notes for humans, ignored by computer.', cn: '写给人看的笔记，电脑会直接忽略它。' } },
};

const COMMON_ESL_WORDS = [
  { en: 'Integer', cn: '整数', type: 'common' },
  { en: 'Variable', cn: '变量', type: 'common' },
  { en: 'Function', cn: '函数', type: 'common' },
  { en: 'Include', cn: '包含', type: 'common' },
  { en: 'Compile', cn: '编译', type: 'common' },
] as const;

export const PROBLEMS: Record<ProblemId, ProblemDef> = {
  ASSIGNMENT: {
    id: 'ASSIGNMENT',
    title: { en: 'Basic Assignment', cn: '基础赋值 (b = a)' },
    description: { 
      en: 'Learn how to get boxes (Declare) and put things in them (Assign).', 
      cn: '学习如何“领盒子”（声明）以及如何“放东西”（赋值）。' 
    },
    summary: {
      en: 'Great job! You learned that new boxes are "dirty" (random junk inside) until you put a value in them.',
      cn: '做得好！你学会了新领的盒子里面是“脏”的（有垃圾值），直到你给它赋值为止。'
    },
    keyTakeaways: [
      { en: 'int a, b; Gets two boxes. They have random junk inside!', cn: 'int a, b; 领了两个盒子。里面一开始装着随机的垃圾！' },
      { en: 'a = 10; Cleans the box and puts 10 in it.', cn: 'a = 10; 把盒子清理干净，放入 10。' },
      { en: 'b = a; Copies the value from a to b.', cn: 'b = a; 把 a 里的东西复印一份，放进 b 里。' }
    ],
    initialValues: { a: 10, b: 20 },
    maxSteps: 4, 
    code: `int a, b;
a = 10;
b = 20;
b = a;`,
    fullCode: `#include <iostream>
using namespace std;

int main() {
    // 1. Get boxes (they contain garbage!)
    int a, b;
    
    // 2. Clean and fill boxes
    a = 10;
    b = 20;
    
    // 3. Copy a to b
    b = a; 
    
    return 0;
}`,
    presets: [
      { label: { en: 'Standard (10 -> 20)', cn: '标准 (10 -> 20)' }, values: { a: 10, b: 20 } },
      { label: { en: 'Big Numbers', cn: '大数复制' }, values: { a: 999, b: 0 } },
    ],
    esl: {
        words: [
            ...COMMON_ESL_WORDS,
            { en: 'Declare', cn: '声明 (领盒子)', type: 'specific' },
            { en: 'Assign', cn: '赋值 (放东西)', type: 'specific' },
            { en: 'Value', cn: '数值 (里面的东东)', type: 'specific' },
            { en: 'Copy', cn: '复制', type: 'specific' }
        ],
        questions: [
            { type: 'match_cn', question: 'Declare', options: ['声明', '销毁', '运行'], correctAnswer: '声明' },
            { type: 'match_en', question: '赋值', options: ['Assign', 'Design', 'Align'], correctAnswer: 'Assign' },
            { type: 'fill_code', question: '____ a = 10; // 创建整数盒子', options: ['int', 'box', 'var'], correctAnswer: 'int' },
            { type: 'match_cn', question: 'Value', options: ['数值', '阀门', '空间'], correctAnswer: '数值' },
        ]
    },
    pseudocode: [
      { text: { en: "Start Program", cn: "程序开始" }, indent: 0, stepTrigger: [0] },
      { text: { en: "Get 2 boxes named 'a' and 'b'", cn: "领两个盒子，名字叫 a 和 b" }, indent: 0, stepTrigger: [1] },
      { text: { en: "Put 10 into box 'a'", cn: "把 10 放进盒子 a" }, indent: 0, stepTrigger: [2] },
      { text: { en: "Put 20 into box 'b'", cn: "把 20 放进盒子 b" }, indent: 0, stepTrigger: [3] },
      { text: { en: "Copy contents of 'a' into 'b'", cn: "把 a 里的东西复制到 b 里" }, indent: 0, stepTrigger: [4] }
    ],
    flowchart: {
      nodes: [
        { id: 'start', type: 'start', label: { en: 'Start', cn: '开始' }, x: 250, y: 20, stepTrigger: [0] },
        { id: 'decl', type: 'process', label: { en: 'Declare a, b', cn: '声明 a, b' }, x: 250, y: 80, stepTrigger: [1] },
        { id: 'initA', type: 'process', label: { en: 'a = 10', cn: 'a = 10' }, x: 250, y: 140, stepTrigger: [2] },
        { id: 'initB', type: 'process', label: { en: 'b = 20', cn: 'b = 20' }, x: 250, y: 200, stepTrigger: [3] },
        { id: 'copy', type: 'process', label: { en: 'b = a', cn: 'b = a' }, x: 250, y: 260, stepTrigger: [4] },
        { id: 'end', type: 'end', label: { en: 'End', cn: '结束' }, x: 250, y: 320, stepTrigger: [] }
      ],
      edges: [
        { from: 'start', to: 'decl' },
        { from: 'decl', to: 'initA' },
        { from: 'initA', to: 'initB' },
        { from: 'initB', to: 'copy' },
        { from: 'copy', to: 'end' }
      ]
    }
  },
  SWAP: {
    id: 'SWAP',
    title: { en: 'Swap Variables', cn: '交换变量' },
    description: { 
      en: 'Exchange the values of two variables using a temporary variable.', 
      cn: '使用临时变量交换两个变量的值。' 
    },
    summary: {
      en: 'You mastered the Swap! Remember, computers need a third "temp" box to switch two values safely.',
      cn: '你掌握了交换！记住，电脑需要第三个 "temp" 盒子才能安全地交换两个数值。'
    },
    keyTakeaways: [
      { en: 'You cannot just swap hands like humans.', cn: '电脑不能像人一样直接左右手互换。' },
      { en: 'Step 1: Save "a" to "temp".', cn: '第一步：先把 "a" 存到 "temp"。' },
      { en: 'Step 2: Overwrite "a" with "b".', cn: '第二步：用 "b" 覆盖 "a"。' },
      { en: 'Step 3: Restore "temp" to "b".', cn: '第三步：把 "temp" 拿给 "b"。' }
    ],
    initialValues: { a: 10, b: 20 },
    maxSteps: 4,
    code: `void swap(int& a, int& b) {
    int temp = a;
    a = b;
    b = temp;
}`,
    fullCode: `#include <iostream>
using namespace std;

void swap(int& a, int& b) {
    int temp = a;
    a = b;
    b = temp;
}

int main() {
    int a = 10;
    int b = 20;
    swap(a, b);
    return 0;
}`,
    presets: [
      { label: { en: 'Standard (10, 20)', cn: '标准 (10, 20)' }, values: { a: 10, b: 20 } },
      { label: { en: 'Large Values', cn: '大数值' }, values: { a: 99, b: 1000 } },
      { label: { en: 'Negative', cn: '负数' }, values: { a: -5, b: 5 } },
    ],
    esl: {
        words: [
            ...COMMON_ESL_WORDS,
            { en: 'Swap', cn: '交换', type: 'specific' },
            { en: 'Temporary', cn: '临时的', type: 'specific' },
            { en: 'Exchange', cn: '互换', type: 'specific' },
            { en: 'Safety', cn: '安全', type: 'specific' }
        ],
        questions: [
            { type: 'match_cn', question: 'Temporary', options: ['临时的', '永久的', '快速的'], correctAnswer: '临时的' },
            { type: 'fill_code', question: 'int ____ = a; // Save a', options: ['temp', 'dump', 'lamp'], correctAnswer: 'temp' },
            { type: 'match_en', question: '交换', options: ['Swap', 'Sweep', 'Stop'], correctAnswer: 'Swap' },
            { type: 'match_cn', question: 'Integer', options: ['整数', '网络', '积分'], correctAnswer: '整数' },
        ]
    },
    pseudocode: [
      { text: { en: "Start Swap", cn: "开始交换" }, indent: 0, stepTrigger: [0] },
      { text: { en: "Create 'temp' box and save 'a' in it", cn: "创建 'temp' 盒子，把 a 存进去" }, indent: 0, stepTrigger: [1] },
      { text: { en: "Overwrite 'a' with 'b'", cn: "把 b 的值覆盖到 a 里" }, indent: 0, stepTrigger: [2] },
      { text: { en: "Overwrite 'b' with 'temp'", cn: "把 temp (原来的a) 覆盖到 b 里" }, indent: 0, stepTrigger: [3] },
      { text: { en: "Swap Complete", cn: "交换完成" }, indent: 0, stepTrigger: [4] }
    ],
    flowchart: {
      nodes: [
        { id: 'start', type: 'start', label: { en: 'Start', cn: '开始' }, x: 250, y: 20, stepTrigger: [0] },
        { id: 'temp', type: 'process', label: { en: 'temp = a', cn: 'temp = a' }, x: 250, y: 90, stepTrigger: [1] },
        { id: 'ab', type: 'process', label: { en: 'a = b', cn: 'a = b' }, x: 250, y: 160, stepTrigger: [2] },
        { id: 'btemp', type: 'process', label: { en: 'b = temp', cn: 'b = temp' }, x: 250, y: 230, stepTrigger: [3] },
        { id: 'end', type: 'end', label: { en: 'End', cn: '结束' }, x: 250, y: 300, stepTrigger: [4] }
      ],
      edges: [
        { from: 'start', to: 'temp' },
        { from: 'temp', to: 'ab' },
        { from: 'ab', to: 'btemp' },
        { from: 'btemp', to: 'end' }
      ]
    }
  },
  FIND_MAX: {
    id: 'FIND_MAX',
    title: { en: 'Find Max of 3', cn: '寻找最大值 (3个数)' },
    description: { 
      en: 'Determine the largest value among three variables.', 
      cn: '找出三个变量中的最大值。' 
    },
    summary: {
      en: 'Excellent! Finding the max is just like a "King of the Hill" game. The winner stays in the "max" box.',
      cn: '太棒了！找最大值就像“擂台赛”。赢家留在 "max" 盒子里，输家就被淘汰。'
    },
    keyTakeaways: [
      { en: 'Assume the first one is the winner (max = a).', cn: '先假设第一个就是冠军 (max = a)。' },
      { en: 'Challenge with the next one. If bigger, update max.', cn: '下一个来挑战。如果更大，就更新 max。' },
      { en: 'Repeat until everyone has challenged.', cn: '一直比到最后，剩下的就是最大值。' }
    ],
    initialValues: { a: 10, b: 30, c: 20 },
    maxSteps: 5,
    code: `int maxOf3(int a, int b, int c) {
    int max = a;
    if (b > max) max = b;
    if (c > max) max = c;
    return max;
}`,
    fullCode: `#include <iostream>
using namespace std;

int maxOf3(int a, int b, int c) {
    int max = a;
    if (b > max) max = b;
    if (c > max) max = c;
    return max;
}

int main() {
    int a = 10, b = 30, c = 20;
    int result = maxOf3(a, b, c);
    return 0;
}`,
    presets: [
      { label: { en: 'Max is B (10, 30, 20)', cn: '最大值是 B (10, 30, 20)' }, values: { a: 10, b: 30, c: 20 } },
      { label: { en: 'Max is A (50, 10, 20)', cn: '最大值是 A (50, 10, 20)' }, values: { a: 50, b: 10, c: 20 } },
      { label: { en: 'Max is C (10, 20, 90)', cn: '最大值是 C (10, 20, 90)' }, values: { a: 10, b: 20, c: 90 } },
      { label: { en: 'All Equal', cn: '全部相等' }, values: { a: 15, b: 15, c: 15 } },
    ],
    esl: {
        words: [
            ...COMMON_ESL_WORDS,
            { en: 'Maximum', cn: '最大值', type: 'specific' },
            { en: 'Compare', cn: '比较', type: 'specific' },
            { en: 'Condition', cn: '条件', type: 'specific' },
            { en: 'Result', cn: '结果', type: 'specific' }
        ],
        questions: [
            { type: 'match_cn', question: 'Maximum', options: ['最大值', '最小值', '平均值'], correctAnswer: '最大值' },
            { type: 'fill_code', question: '___ (b > max)', options: ['if', 'is', 'in'], correctAnswer: 'if' },
            { type: 'match_en', question: '比较', options: ['Compare', 'Compile', 'Complete'], correctAnswer: 'Compare' },
            { type: 'match_cn', question: 'Condition', options: ['条件', '空调', '传统'], correctAnswer: '条件' },
        ]
    },
    pseudocode: [
      { text: { en: "Start", cn: "开始" }, indent: 0, stepTrigger: [0] },
      { text: { en: "Set max = a", cn: "设 max = a (假设a是冠军)" }, indent: 0, stepTrigger: [1] },
      { text: { en: "Is b > max?", cn: "b 比 max 大吗？" }, indent: 0, stepTrigger: [2] },
      { text: { en: "Yes: Set max = b", cn: "是：设 max = b" }, indent: 1, stepTrigger: [3] },
      { text: { en: "Is c > max?", cn: "c 比 max 大吗？" }, indent: 0, stepTrigger: [4] },
      { text: { en: "Yes: Set max = c", cn: "是：设 max = c" }, indent: 1, stepTrigger: [5] },
    ],
    flowchart: {
      nodes: [
        { id: 'start', type: 'start', label: { en: 'Start', cn: '开始' }, x: 250, y: 20, stepTrigger: [0] },
        { id: 'init', type: 'process', label: { en: 'max = a', cn: 'max = a' }, x: 250, y: 80, stepTrigger: [1] },
        { id: 'condB', type: 'decision', label: { en: 'b > max?', cn: 'b > max?' }, x: 250, y: 150, stepTrigger: [2] },
        { id: 'setB', type: 'process', label: { en: 'max = b', cn: 'max = b' }, x: 400, y: 150, stepTrigger: [3] },
        { id: 'condC', type: 'decision', label: { en: 'c > max?', cn: 'c > max?' }, x: 250, y: 240, stepTrigger: [4] },
        { id: 'setC', type: 'process', label: { en: 'max = c', cn: 'max = c' }, x: 400, y: 240, stepTrigger: [5] },
        { id: 'end', type: 'end', label: { en: 'End', cn: '结束' }, x: 250, y: 320, stepTrigger: [] }
      ],
      edges: [
        { from: 'start', to: 'init' },
        { from: 'init', to: 'condB' },
        { from: 'condB', to: 'setB', label: {en: 'Yes', cn: '是'} },
        { from: 'condB', to: 'condC', label: {en: 'No', cn: '否'} },
        { from: 'setB', to: 'condC' },
        { from: 'condC', to: 'setC', label: {en: 'Yes', cn: '是'} },
        { from: 'condC', to: 'end', label: {en: 'No', cn: '否'} },
        { from: 'setC', to: 'end' }
      ]
    }
  },
  SORT_3: {
    id: 'SORT_3',
    title: { en: 'Sort 3 Variables', cn: '排序 (3个数)' },
    description: { 
      en: 'Sort three variables in ascending order using swaps.', 
      cn: '使用交换将三个变量按升序排序。' 
    },
    summary: {
      en: 'You did it! Sorting is just comparing neighbors and swapping them if they are in the wrong order.',
      cn: '成功了！排序就是比较相邻的两个数，如果顺序不对（左边比右边大），就交换它们。'
    },
    keyTakeaways: [
      { en: 'Order Matters: We want Small -> Medium -> Large.', cn: '顺序很重要：我们要 小 -> 中 -> 大。' },
      { en: 'Compare A & B. Swap if A > B.', cn: '先比 A 和 B。如果 A 大，就交换。' },
      { en: 'Compare B & C. Swap if B > C.', cn: '再比 B 和 C。如果 B 大，就交换。' },
      { en: 'Check A & B one last time!', cn: '最后再检查一遍 A 和 B！' }
    ],
    initialValues: { a: 30, b: 10, c: 20 },
    maxSteps: 3,
    code: `void sort3(int& a, int& b, int& c) {
    if (a > b) std::swap(a, b);
    if (b > c) std::swap(b, c);
    if (a > b) std::swap(a, b);
}`,
    fullCode: `#include <iostream>
#include <algorithm> // for std::swap
using namespace std;

void sort3(int& a, int& b, int& c) {
    if (a > b) std::swap(a, b);
    if (b > c) std::swap(b, c);
    if (a > b) std::swap(a, b);
}

int main() {
    int a = 30, b = 10, c = 20;
    sort3(a, b, c);
    return 0;
}`,
    presets: [
      { label: { en: 'Reverse (3, 2, 1)', cn: '逆序 (3, 2, 1)' }, values: { a: 30, b: 20, c: 10 } },
      { label: { en: 'Sorted (1, 2, 3)', cn: '已排序 (1, 2, 3)' }, values: { a: 10, b: 20, c: 30 } },
      { label: { en: 'Mixed (3, 1, 2)', cn: '乱序 (3, 1, 2)' }, values: { a: 30, b: 10, c: 20 } },
      { label: { en: 'Mixed (1, 3, 2)', cn: '乱序 (1, 3, 2)' }, values: { a: 10, b: 30, c: 20 } },
      { label: { en: 'Mixed (2, 3, 1)', cn: '乱序 (2, 3, 1)' }, values: { a: 20, b: 30, c: 10 } },
    ],
    esl: {
        words: [
            ...COMMON_ESL_WORDS,
            { en: 'Sort', cn: '排序', type: 'specific' },
            { en: 'Order', cn: '顺序', type: 'specific' },
            { en: 'Ascending', cn: '升序 (从小到大)', type: 'specific' },
            { en: 'Algorithm', cn: '算法', type: 'specific' }
        ],
        questions: [
            { type: 'match_cn', question: 'Order', options: ['顺序', '点餐', '命令'], correctAnswer: '顺序' },
            { type: 'match_en', question: '升序', options: ['Ascending', 'Descending', 'Pending'], correctAnswer: 'Ascending' },
            { type: 'fill_code', question: 'std::____(a, b); // Exchange', options: ['swap', 'sort', 'switch'], correctAnswer: 'swap' },
            { type: 'match_cn', question: 'Algorithm', options: ['算法', '算术', '节奏'], correctAnswer: '算法' },
        ]
    },
    pseudocode: [
      { text: { en: "Start", cn: "开始" }, indent: 0, stepTrigger: [0] },
      { text: { en: "If A > B, swap them", cn: "如果 A > B，交换它们" }, indent: 0, stepTrigger: [1] },
      { text: { en: "If B > C, swap them", cn: "如果 B > C，交换它们" }, indent: 0, stepTrigger: [2] },
      { text: { en: "If A > B, swap them (again)", cn: "如果 A > B，再次交换它们" }, indent: 0, stepTrigger: [3] }
    ],
    flowchart: {
      nodes: [
        { id: 'start', type: 'start', label: { en: 'Start', cn: '开始' }, x: 250, y: 20, stepTrigger: [0] },
        { id: 'c1', type: 'process', label: { en: 'Sort A, B', cn: '排 A, B' }, x: 250, y: 90, stepTrigger: [1] },
        { id: 'c2', type: 'process', label: { en: 'Sort B, C', cn: '排 B, C' }, x: 250, y: 160, stepTrigger: [2] },
        { id: 'c3', type: 'process', label: { en: 'Sort A, B', cn: '排 A, B' }, x: 250, y: 230, stepTrigger: [3] },
        { id: 'end', type: 'end', label: { en: 'End', cn: '结束' }, x: 250, y: 300, stepTrigger: [] }
      ],
      edges: [
        { from: 'start', to: 'c1' },
        { from: 'c1', to: 'c2' },
        { from: 'c2', to: 'c3' },
        { from: 'c3', to: 'end' }
      ]
    }
  }
};

export const getStepLineMapping = (id: ProblemId, step: number): number => {
  switch (id) {
    case 'ASSIGNMENT':
        // 0: Start
        // 1: int a, b;
        // 2: a = 10;
        // 3: b = 20;
        // 4: b = a;
        return step <= 1 ? 0 : step - 1;
    case 'SWAP':
      return step === 0 ? 0 : step;
    case 'FIND_MAX':
      return step === 0 ? 0 : step; 
    case 'SORT_3':
      return step === 0 ? 0 : step;
    default:
      return 0;
  }
};
