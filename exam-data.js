(function (root, factory) {
  const paper = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = paper;
  }
  root.ExamPaper = paper;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const raw = String.raw;

  return {
    title: '2026届初中毕业暨升学考试模拟试卷 数学',
    subject: '数学',
    date: '2026.04',
    summary: '共27小题，满分130分，考试时间120分钟。',
    notes: [
      '本试卷由选择题、填空题和解答题三大题组成。',
      '答题前，考生务必将姓名、考点名称、考场号、座位号、考试号填涂在答题卡相应的位置上。',
      '选择题答案须使用2B铅笔填涂；非选择题须用0.5毫米黑色墨水签字笔作答。',
    ],
    figures: [
      { id: 'q2-mortise', title: '第2题 燕尾榫带榫头及主视图选项', kind: 'svg', renderer: 'mortiseViews' },
      { id: 'q5-parallel-board', title: '第5题 平行线间三角板位置图', kind: 'svg', renderer: 'parallelBoard' },
      { id: 'q7-rhombus', title: '第7题 菱形与辅助线', kind: 'svg', renderer: 'rhombus' },
      { id: 'q13-tile', title: '第13题 4×4正方形地砖阴影图', kind: 'svg', renderer: 'tileProbability' },
      { id: 'q15-magic-square', title: '第15题 洛书与三阶幻方', kind: 'svg', renderer: 'magicSquare' },
      { id: 'q16-rotation', title: '第16题 平行四边形旋转图', kind: 'svg', renderer: 'parallelogramRotation' },
      { id: 'q20-medians', title: '第20题 等腰三角形中线图', kind: 'svg', renderer: 'triangleMedians' },
      { id: 'q21-bmi-charts', title: '第21题 BMI条形统计图与扇形统计图', kind: 'svg', renderer: 'bmiCharts' },
      {
        id: 'q23-measurement',
        title: '第23题 纪念碑实物照片与高度测量示意图',
        kind: 'mixed',
        renderer: 'monumentMeasurement',
        photo: {
          src: 'assets/q23-monument-photo.png',
          alt: '苏州烈士陵园纪念碑实物照片',
        },
      },
      { id: 'q24-functions', title: '第24题 反比例函数与一次函数图像', kind: 'svg', renderer: 'inverseProportion' },
      { id: 'q25-circle', title: '第25题 圆与切线图', kind: 'svg', renderer: 'circleTangent' },
      { id: 'q26-parabolas', title: '第26题 抛物线与矩形示意图', kind: 'svg', renderer: 'parabolas' },
      { id: 'q27-golden', title: '第27题 正方形、矩形中的黄金分割图', kind: 'svg', renderer: 'goldenGeometry' },
    ],
    omittedAssets: [],
    sections: [
      {
        type: 'choice',
        title: '一、选择题',
        description: '本题满分24分，共8小题，每小题3分。',
        items: [
          {
            id: 1,
            score: 3,
            blocks: [
              { type: 'p', text: raw`$-\frac{1}{2}$的绝对值是` },
            ],
            options: [
              { label: 'A', text: raw`$\frac{1}{2}$` },
              { label: 'B', text: raw`$-\frac{1}{2}$` },
              { label: 'C', text: raw`$-2$` },
              { label: 'D', text: raw`$2$` },
            ],
          },
          {
            id: 2,
            score: 3,
            figureIds: ['q2-mortise'],
            blocks: [
              { type: 'p', text: '明式家具的核心产地在以苏州为中心的江南地区，因此也被称为“苏作家具”。明式家具中用到许多榫卯结构，比如燕尾榫。如图是燕尾榫的带榫头部分，下列图形是其主视图的是' },
            ],
            options: [
              { label: 'A', text: '图A' },
              { label: 'B', text: '图B' },
              { label: 'C', text: '图C' },
              { label: 'D', text: '图D' },
            ],
          },
          {
            id: 3,
            score: 3,
            blocks: [
              { type: 'p', text: '下列运算中，正确的是' },
            ],
            options: [
              { label: 'A', text: raw`$a^2+a^3=a^5$` },
              { label: 'B', text: raw`$(a^3)^2=a^9$` },
              { label: 'C', text: raw`$a^4\cdot a^2=a^8$` },
              { label: 'D', text: raw`$a^7\div a^4=a^3$` },
            ],
          },
          {
            id: 4,
            score: 3,
            blocks: [
              { type: 'p', text: '2026年3月，中国科学院潘建伟院士团队成功构建了105比特超导量子计算原型机“祖冲之三号”，量子比特相干时间达到0.000 072秒，实现了对“量子随机线路采样”任务的快速求解。数据0.000 072用科学记数法表示为' },
            ],
            options: [
              { label: 'A', text: raw`$0.72\times10^{-4}$` },
              { label: 'B', text: raw`$7.2\times10^{-5}$` },
              { label: 'C', text: raw`$72\times10^{-6}$` },
              { label: 'D', text: raw`$72\times10^{-7}$` },
            ],
          },
          {
            id: 5,
            score: 3,
            figureIds: ['q5-parallel-board'],
            blocks: [
              { type: 'p', text: raw`如图，直线$AB\parallel CD$，将一副三角板放置在$AB$和$CD$之间，点$G$在$AB$上，点$N$在$CD$上，并且点$G$，$F$，$M$在同一条直线上。已知$\angle1=50^\circ$，则$\angle2$的度数为` },
            ],
            options: [
              { label: 'A', text: raw`$50^\circ$` },
              { label: 'B', text: raw`$45^\circ$` },
              { label: 'C', text: raw`$40^\circ$` },
              { label: 'D', text: raw`$30^\circ$` },
            ],
          },
          {
            id: 6,
            score: 3,
            blocks: [
              { type: 'p', text: '2026年江苏省城市足球联赛整体球员平均年龄为22.32岁，以下是部分球员的年龄（单位：岁）：22，20，23，17，18，21，18，18，24，20。则这组数据的众数和中位数分别是' },
            ],
            options: [
              { label: 'A', text: '18和20' },
              { label: 'B', text: '18和21' },
              { label: 'C', text: '20和18' },
              { label: 'D', text: '20和21' },
            ],
          },
          {
            id: 7,
            score: 3,
            figureIds: ['q7-rhombus'],
            blocks: [
              { type: 'p', text: raw`如图，菱形$ABCD$的对角线$AC=6$，$BD=12$，交点为$O$，点$F$在$OC$上，且$CF=2OF$，过点$F$作$EF\parallel BC$交$AB$于点$E$。则$\triangle AEF$的面积为` },
            ],
            options: [
              { label: 'A', text: '10' },
              { label: 'B', text: '8' },
              { label: 'C', text: '6' },
              { label: 'D', text: '5' },
            ],
          },
          {
            id: 8,
            score: 3,
            blocks: [
              { type: 'p', text: raw`我们将关于$x$的一元二次方程$a_1(x-m)^2+n=0$与$a_2(x-m)^2+n=0$称为“同构二次方程”。比如$2(x-2)^2-4=0$与$3(x-2)^2-4=0$就是“同构二次方程”。已知两个关于$x$的一元二次方程$2(x-1)^2-1=0$与$(a+1)x^2+(b-2)x-2=0$是“同构二次方程”，则$a$，$b$的值分别为` },
            ],
            options: [
              { label: 'A', text: raw`$1,\ -1$` },
              { label: 'B', text: raw`$-1,\ 2$` },
              { label: 'C', text: raw`$-2,\ 4$` },
              { label: 'D', text: raw`$-2,\ 0$` },
            ],
          },
        ],
      },
      {
        type: 'blank',
        title: '二、填空题',
        description: '本题满分24分，共8小题，每小题3分。',
        items: [
          {
            id: 9,
            score: 3,
            blocks: [
              { type: 'p', text: raw`二次根式$\sqrt{x-5}$有意义，则$x$的取值范围是____。` },
            ],
          },
          {
            id: 10,
            score: 3,
            blocks: [
              { type: 'p', text: raw`分解因式：$4m^2-16=$____。` },
            ],
          },
          {
            id: 11,
            score: 3,
            blocks: [
              { type: 'p', text: raw`已知$P(x，y)$是第二象限内的点，且点$P$到$x$轴、$y$轴的距离分别为3和5，则点$P$的坐标为____。` },
            ],
          },
          {
            id: 12,
            score: 3,
            blocks: [
              { type: 'p', text: raw`一个扇形的半径为6，圆心角为$120^\circ$，此扇形的弧长为____（结果保留$\pi$）。` },
            ],
          },
          {
            id: 13,
            score: 3,
            figureIds: ['q13-tile'],
            blocks: [
              { type: 'p', text: '如图是4×4的正方形地砖，大课间小苏利用该地砖玩起了投掷石子的游戏，假设石子投中每一处是等可能的（投中边界或没有击中该地砖，则重投一次），任意投掷石子一次，石子投中阴影部分的概率是____。' },
            ],
          },
          {
            id: 14,
            score: 3,
            blocks: [
              { type: 'p', text: raw`已知二次函数$y=x^2-4x+m$的图象与坐标轴有且只有2个公共点，则$m$的值为____。` },
            ],
          },
          {
            id: 15,
            score: 3,
            figureIds: ['q15-magic-square'],
            blocks: [
              { type: 'p', text: '“洛书”是古老华夏智慧的数学结晶（如图1），是世界上最早的“幻方”。把9个数填入3×3方格中，使其任意一行、任意一列及两条对角线上的数之和都相等，这样便构成了一个“三阶幻方”，图2是仅可以看到部分数值的“三阶幻方”，则其中a，b，c之间的关系为____。' },
            ],
          },
          {
            id: 16,
            score: 3,
            figureIds: ['q16-rotation'],
            blocks: [
              { type: 'p', text: raw`如图，在$\square ABCD$中，$AD=6$。将$\square ABCD$绕点$A$旋转至$\square AEFG$，使得点$E$落在对角线$AC$上，若此时点$B$，$E$，$D$，$F$恰在同一条直线上，则$C$，$G$两点间的距离为____。` },
            ],
          },
        ],
      },
      {
        type: 'solution',
        title: '三、解答题',
        description: '本题满分82分，共11小题。',
        items: [
          {
            id: 17,
            score: 5,
            blocks: [
              { type: 'p', text: raw`计算：$\sqrt{18}+|\sqrt{2}-2|+(-2)^0$。` },
            ],
          },
          {
            id: 18,
            score: 5,
            blocks: [
              { type: 'p', text: '解不等式组' },
              { type: 'display', text: raw`\begin{cases}3x+1>x-5,\\x-2\le -1.\end{cases}` },
            ],
          },
          {
            id: 19,
            score: 6,
            blocks: [
              { type: 'p', text: raw`先化简，再求值：$\left(1+\frac{1}{a-3}\right)\div\frac{a-2}{a^2-6a+9}$，其中$a=-2$。` },
            ],
          },
          {
            id: 20,
            score: 6,
            figureIds: ['q20-medians'],
            blocks: [
              { type: 'p', text: raw`已知：如图，在$\triangle ABC$中，$AB=AC$，$BE$，$CD$是中线。` },
              { type: 'p', text: raw`求证：$BE=CD$。` },
            ],
          },
          {
            id: 21,
            score: 6,
            figureIds: ['q21-bmi-charts'],
            blocks: [
              { type: 'p', text: raw`“健康第一”是苏州市教育局2026年春季开展的一项以学生身心健康为核心的教育主题活动，旨在落实体育强身、心理润心、近视防控、睡眠管理等工作，促进学生全面健康成长。某数学学习小组为了解本校九年级学生的健康情况，开展了相关调查活动，随机抽取了部分学生调查他们身体质量指数“BMI”数据，其计算公式为$BMI=\frac{m}{h^2}$（$m$表示体重，单位：千克；$h$表示身高，单位：米）。BMI标准见表：` },
              {
                type: 'table',
                rows: [
                  ['BMI的范围', raw`$BMI\le18.5$`, raw`$18.5<BMI\le24.0$`, raw`$24.0<BMI\le28.0$`, raw`$BMI>28.0$`],
                  ['健康类型', '体重过低', '正常', '超重', '肥胖'],
                ],
              },
              { type: 'p', text: '【收集数据】随机抽取该校部分学生，测算出他们的BMI数据组成样本。' },
              { type: 'p', text: '【整理数据】将学生的BMI数据按照以下标准分成A，B，C，D四组进行整理，如下表：' },
              {
                type: 'table',
                rows: [
                  ['类别', 'A', 'B', 'C', 'D'],
                  ['BMI(kg/m²)', raw`$BMI\le18.5$`, raw`$18.5<BMI\le24.0$`, raw`$24.0<BMI\le28.0$`, raw`$BMI>28.0$`],
                  ['体重情况', '过低', '正常', '超重', '肥胖'],
                  ['人数(人)', raw`$n$`, '36', '9', '3'],
                ],
              },
              { type: 'p', text: '【描述数据】根据学生的BMI数据绘制了如下两幅不完整的统计图。' },
              {
                type: 'list',
                items: [
                  '参与本次调查的学生人数为____；',
                  '补全条形统计图；',
                  '若该校九年级共有600名学生，请估计身体质量指数正常的学生人数。',
                ],
              },
            ],
          },
          {
            id: 22,
            score: 8,
            blocks: [
              { type: 'p', text: '苏州博物馆推出“非遗体验日”活动，设置了三项代表性体验项目：A. 宋锦织造技艺，B. 香山帮传统建筑营造技艺，C. 苏州缂丝织造技艺。甲、乙两名中学生各自独立地从三项活动中随机选择一项参与体验。' },
              {
                type: 'list',
                items: [
                  '甲同学选择A项目（宋锦织造技艺）的概率为____；',
                  '请运用画树状图或列表的方法，求甲、乙两名同学选择项目恰好包含B项目（香山帮传统建筑营造技艺）但不包含C项目（苏州缂丝织造技艺）的概率。',
                ],
              },
            ],
          },
          {
            id: 23,
            score: 8,
            figureIds: ['q23-measurement'],
            blocks: [
              { type: 'p', text: '缅怀革命先烈，传承红色基因。清明节期间，某数学兴趣小组前往苏州烈士陵园开展实践活动，对纪念碑的高度进行测量，相关测量数据记录如下：' },
              {
                type: 'table',
                rows: [
                  ['活动主题', '测量纪念碑的高度'],
                  ['实物图和测量示意图', '实物照片和测量示意图见下方。'],
                  ['测量步骤', raw`如图，某同学在点$C$处用测角仪测得纪念碑$AB$的最高点$A$的仰角，另一名同学在他的正后方16 m的点$E$处用相同的测角仪测得点$A$的仰角（测角仪的高度为1.5 m），且图中所有的点$A$，$B$，$C$，$D$，$E$，$F$都在同一平面内，$AB\perp BE$，$DC\perp BE$，$FE\perp BE$，垂足分别为$B$，$C$，$E$。`],
                  ['测量数据', raw`在点$C$处测得点$A$的仰角为$42^\circ$，在点$E$处测得点$A$的仰角为$30^\circ$。`],
                  ['参考数据', raw`$\sin42^\circ\approx0.67$，$\cos42^\circ\approx0.74$，$\tan42^\circ\approx0.90$，$\sqrt3\approx1.73$`],
                ],
              },
              { type: 'p', text: raw`根据以上信息，求该纪念碑$AB$的高度（结果精确到0.1 m）。` },
            ],
          },
          {
            id: 24,
            score: 8,
            figureIds: ['q24-functions'],
            blocks: [
              { type: 'p', text: raw`如图，在平面直角坐标系中，$O$为坐标原点，反比例函数$y=\frac{k}{x}(k\ne0)$的图象与正比例函数$y=-\frac{2}{3}x$的图象交于$A$，$B$两点，其中点$A$的坐标为$(-3,m)$。` },
              {
                type: 'list',
                items: [
                  raw`求$k$的值；`,
                  raw`当$\frac{k}{x}>-\frac{2}{3}x$时，自变量$x$的取值范围为____；`,
                  raw`将直线$AB$向上平移后，与反比例函数图象交于$C$，$D$两点，与两坐标轴分别相交于$E$，$F$两点。若$S_{\triangle OBC}=12$，求直线$CD$的函数表达式。`,
                ],
              },
            ],
          },
          {
            id: 25,
            score: 10,
            figureIds: ['q25-circle'],
            blocks: [
              { type: 'p', text: raw`如图，$AB$是$\odot O$直径，点$E$在$\odot O$上，点$C$是半径$OB$上一点，且满足$OC=2BC$，过点$C$作$AB$的垂线交$AE$的延长线于点$D$。过点$E$作$\odot O$的切线交$CD$于点$F$。` },
              {
                type: 'list',
                items: [
                  raw`求证：$DF=EF$；`,
                  raw`已知$\cos A=\frac{3}{5}$，$EF=5$。①求$\odot O$的半径；②如果点$C$在$OB$的延长线上，其它条件不变，则$\odot O$的半径为____。`,
                ],
              },
            ],
          },
          {
            id: 26,
            score: 10,
            figureIds: ['q26-parabolas'],
            blocks: [
              { type: 'p', text: raw`如图，抛物线$C_1:y=ax^2+bx+c$过点$O(0,0)$，$E(10,0)$，矩形$ABCD$的边$AB$在线段$OE$上（点$B$在点$A$的左侧），点$C$，$D$在抛物线上。设$B(t,0)$，当$t=2$时，$BC=8$。` },
              {
                type: 'list',
                items: [
                  raw`求抛物线$C_1$的函数表达式；`,
                  raw`当$t$为何值时，矩形$ABCD$的周长有最大值？最大值是多少？`,
                  raw`如图2，保持$t=2$时的矩形$ABCD$位置不动，平移抛物线$C_1$使之经过点$D$，得到抛物线$C_2:y_2=ax^2+dx+40$，过点$D$的直线交抛物线$C_1$和$C_2$于$M$，$N$（点$M$，$N$均不与点$D$重合），设点$M$的横坐标为$m$，设点$N$的横坐标为$n$，请求出$|m-n|$的值。`,
                ],
              },
            ],
          },
          {
            id: 27,
            score: 10,
            figureIds: ['q27-golden'],
            blocks: [
              {
                type: 'list',
                items: [
                  raw`如图1，正方形$ABCD$中，点$E$，$F$分别在边$BC$，$CD$上，且$BE=CF$，$AE$，$BF$相交于点$G$，连接$CG$并延长，交$AB$于点$M$。①$AE$与$BF$的关系为____；②若$M$是$AB$中点。求证：点$E$是$BC$的一个黄金分割点；`,
                  raw`如图2，矩形$ABCD$中，$E$是$BC$边的中点，连接$AE$，过点$B$作$BF\perp AE$，垂足为$G$，交$CD$于点$F$，连接$CG$并延长，交$AB$于点$M$。若点$G$是线段$CM$的一个黄金分割点，且$CG>GM$，求$\frac{AM}{BM}$的值。`,
                ],
              },
            ],
          },
        ],
      },
    ],
  };
});
