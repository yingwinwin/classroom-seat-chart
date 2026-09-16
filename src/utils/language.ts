export type Language = 'ja' | 'zh';

export const text = {
  ja: {
    listName: '名簿名', savedLists: '保存済み名簿', selectList: '名簿を選択', saveList: '名簿を保存', readList: '名簿を読み込む', editList: '名簿を編集', deleteList: '名簿を削除', studentCount: (count: number) => `生徒数：${count}人`, listNameRequired: '名簿名を入力してください。',
    title: '座席表作成ツール', classroom: '教室', selectClassroom: '教室を選択', edit: '教室を編集', remove: '教室を削除', create: '新しい教室', students: '生徒名簿', studentPlaceholder: '1行に1名ずつ入力\n例：\n山田太郎\n佐藤花子', assign: '座席を自動配置', tooMany: '生徒数が現在の教室の座席数を超えています。', teacherView: '先生用', studentView: '生徒用', teacherExcel: '先生用 Excel をダウンロード', studentExcel: '生徒用 Excel をダウンロード', noClassroom: '先に教室を作成してください。', confirmDelete: (name: string) => `「${name}」を削除しますか？`, newClassroom: '新しい教室', editClassroom: '教室を編集', classroomName: '教室名', tableLayout: '机の配置', row: (index: number) => `${index}列目`, deleteTable: '机を削除', addTable: '机を追加', deleteRow: 'この列を削除', addRow: '＋ 列を追加', cancel: 'キャンセル', save: '教室を保存', desk: (count: number) => `${count}人机`, front: 'ホワイトボード', emptySeat: '空席', language: '日本語', otherLanguage: '中文',
  },
  zh: {
    listName: '名单名称', savedLists: '已保存名单', selectList: '选择名单', saveList: '保存名单', readList: '读取名单', editList: '编辑名单', deleteList: '删除名单', studentCount: (count: number) => `学生人数：${count}人`, listNameRequired: '请输入名单名称。',
    title: '座席表生成器', classroom: '教室', selectClassroom: '请选择教室', edit: '编辑教室', remove: '删除教室', create: '新建教室', students: '学生名单', studentPlaceholder: '每行输入一名学生\n例如：\n王小明\n李小红', assign: '自动排座', tooMany: '学生人数超过当前教室的座位数量。', teacherView: '老师视角', studentView: '学生视角', teacherExcel: '下载老师点名版 Excel', studentExcel: '下载学生黑板版 Excel', noClassroom: '请先新建一个教室。', confirmDelete: (name: string) => `确定删除「${name}」吗？`, newClassroom: '新建教室', editClassroom: '编辑教室', classroomName: '教室名称', tableLayout: '桌子布局', row: (index: number) => `第${index}排`, deleteTable: '删除桌子', addTable: '添加桌子', deleteRow: '删除本排', addRow: '＋ 添加一排', cancel: '取消', save: '保存教室', desk: (count: number) => `${count}人桌`, front: '白板', emptySeat: '空座位', language: '中文', otherLanguage: '日本語',
  },
} as const;
