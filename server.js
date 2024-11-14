const express = require('express');
const path = require('path'); // path 모듈 추가
const { MongoClient } = require('mongodb');
const app = express();

// 정적 파일 경로 설정 (CSS, JS 파일을 public 폴더에 배치했을 경우)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// EJS 템플릿 엔진 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // views 폴더 경로 정확하게 설정

let db;
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

/* 더미 데이터 추가 함수 */
async function addDummyData() {
  try {
    const collection = db.collection('ingredient');
    
    // 컬렉션 비우기
    await collection.deleteMany({});

    const dummyRecipes = [
      {
        name: "스파게티 카르보나라",
        category: "Western",
        ingredients: ["스파게티", "소금", "치즈", "계란", "베이컨", "마늘", "올리브 오일", "후추", "파슬리"],
        calories: 450,
        fat: 31,
        carbohydrate: 65,
        protein: 14,
        instructions: [
          "1. 물 1리터를 끓이고 소금을 한 줌 넣어 스파게티를 삶는다.",
          "2. 치즈는 2-3T 정도 갈아둔다.",
          "3. 계란 1개에 노른자 1개를 볼에 넣는다. 소스가 넉넉한 게 좋으면 계란 2개를 전부 넣고, 치즈 양을 살짝 늘리면 된다.",
          "4. 위스크로 치즈와 계란을 잘 섞고, 면수를 두 국자(약 90ml) 정도 넣어가며 계속 젓는다.",
          "5. 팬에 오일을 살짝만 두르고 베이컨을 굽는데, 베이컨에서 기름이 나오면 다진 마늘을 넣고 잘 볶는다.",
          "6. 삶은 면도 추가해서 살짝 볶아준다.",
          "7. 불을 약불로 줄이고, 계란 믹스처를 팬에 붓는다. 계란이 덩어리질 것 같으면 불을 아예 꺼서 팬 온도를 살짝 내려준다.",
          "8. 약불로 소스와 면이 잘 어우러질 때까지 뒤적인다. 너무 뻑뻑해지면 면수를 조금씩 더 추가한다.",
          "9. 마지막으로 굵게 간 후추를 뿌린다. 면수에 간을 제대로 했으면 간이 딱 맞지만, 혹시 부족하면 지금 소금으로 간을 맞춘다.",
          "10. 접시에 담고 치즈 간 것이나 파슬리를 뿌려서 완성한다."
        ]
      },
      {
        name: "김치찌개",
        category: "Korean",
        ingredients: ["김치", "돼지고기", "두부", "대파", "마늘", "고춧가루", "된장", "소금", "후추", "계란"],
        calories: 300,
        fat: 11,
        carbohydrate: 10,
        protein: 11,
        instructions: [
          "1. 냄비에 물을 붓고 잘 익은 김치와 돼지고기를 넣어 끓인다.",
          "2. 끓기 시작하면 다진 마늘과 고춧가루, 된장을 넣고 잘 저어준다.",
          "3. 김치와 고기가 부드러워질 때까지 끓인다.",
          "4. 두부를 큼직하게 썰어 넣고 대파를 어슷썰어 넣는다.",
          "5. 소금과 후추로 간을 맞추고 한 번 더 끓여서 완성한다."
        ]
      }
    ];

    // 데이터 삽입
    await collection.insertMany(dummyRecipes);
    console.log("더미 데이터가 성공적으로 추가되었습니다.");
  } catch (err) {
    console.error("더미 데이터 추가 중 오류 발생:", err);
  }
}

// MongoDB 연결 및 서버 시작
client.connect().then(async () => {
  db = client.db('recipe_finder');
  await addDummyData();

  app.listen(8081, () => console.log('http://localhost:8081 에서 서버 실행 중'));
}).catch(console.error);

// 처음 접속할 때 페이지 렌더링
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Recipe Finder', // 제목을 설정
    activePage: 'Recipes', // 활성화된 페이지 설정
    recipesByCategory: null
  });
});

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
