const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();

app.use(express.static(__dirname + '/public'));
app.use(express.json());

// EJS 템플릿 엔진 설정
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

let db;
const url = '';
const client = new MongoClient(url);

/*더미 데이터 추가*/

client.connect().then(async () => {
  db = client.db('recipe_finder');
  await addDummyData();

  app.listen(8081, () => console.log('http://localhost:8081 에서 서버 실행 중'));
}).catch(console.error);

// 처음 접속할 때 페이지 렌더링
app.get('/', (req, res) => res.render('index', { recipesByCategory: null }));

// 재료로 레시피 검색
app.post('/search', async (req, res) => {
  const ingredients = req.body.ingredients.map(item => item.trim());

  try {
    const categories = ["Korean", "Western", "Chinese", "Japanese"];
    const recipesByCategory = {};

    for (const category of categories) {
      recipesByCategory[category] = await db.collection('ingredient').find({
        ingredients: { $in: ingredients },
        category: category
      }).limit(5).toArray();
    }

    res.json({ success: true, recipesByCategory });
  } catch (error) {
    console.error("레시피 검색 중 오류:", error);
    res.status(500).json({ success: false, message: '레시피 검색 중 오류 발생' });
  }
});
