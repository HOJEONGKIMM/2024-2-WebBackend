document.getElementById('ingredientForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  // 입력된 재료 값을 가져와 ','로 구분된 문자열을 배열로 변환
  const ingredientInput = document.getElementById('ingredients').value;
  const ingredients = ingredientInput.split(',').map(item => item.trim());

  // 레시피 목록을 표시할 요소 선택 및 로딩 메시지 표시
  const recipeList = document.getElementById('recipeList');
  
  // 로딩 메시지 표시
  recipeList.innerHTML = '<li>Loading recipes...</li>';

  try {
    // '/search' 엔드포인트로 재료 목록을 포함하여 POST 요청 전송
    const response = await fetch('/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ingredients })
    });

    const data = await response.json();
    recipeList.innerHTML = '';

    // 응답 데이터가 성공이고, 레시피가 존재하는 경우 레시피 목록을 화면에 추가
    if (data.success && data.recipes.length > 0) {
      data.recipes.forEach(recipe => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
          <strong>${recipe.name}</strong> - ${recipe.calories} kcal<br>
          <em>Instructions:</em> ${recipe.instructions}
        `;
        recipeList.appendChild(listItem); // 목록에 항목 추가
      });
    } else {
      // 일치하는 레시피가 없는 경우 메시지 표시
      recipeList.innerHTML = '<li>No matching recipes found.</li>';
    }
  } catch (error) {
    console.error('Error fetching recipes:', error);
    recipeList.innerHTML = '<li>Error fetching recipes</li>';
  }
});

/* // Chart.js 인스턴스 저장용 전역 변수
let currentMacroChart = null;

// 레시피 상세 정보 표시 함수
function showRecipeDetails(recipe) {
  const rightColumn = document.querySelector('.right-column');
  rightColumn.style.display = 'block';
  
  // 기본 정보 업데이트
  document.getElementById('recipeTitle').innerText = recipe.name;
  document.getElementById('recipeCalories').innerText = recipe.calories + ' kcal';
  document.getElementById('recipeIngredients').innerText = recipe.ingredients.join(', ');
  
  // 컨테이너 초기화
  const instructionsContainer = document.getElementById('recipeInstructions');
  const macronutrientsContainer = document.getElementById('recipeMacronutrients');
  instructionsContainer.innerHTML = '';
  macronutrientsContainer.innerHTML = '';

  // 영양정보 리스트 업데이트
  document.getElementById("recipeMacronutrients").innerHTML = `
    <ul style="list-style-type: disc; margin: 0; padding-left: 20px;">
      <li>탄수화물: ${recipe.carbohydrate}g</li>
      <li>단백질: ${recipe.protein}g</li>
      <li>지방: ${recipe.fat}g</li>
    </ul>
  `;

  // 조리 방법 추가
  recipe.instructions.forEach(instruction => {
    const li = document.createElement('li');
    li.textContent = instruction;
    instructionsContainer.appendChild(li);
  });
  
  // 영양소 차트 업데이트
  updateMacroChart(recipe);
}

// 영양소 차트 업데이트 함수
function updateMacroChart(recipe) {
  // 기존 차트가 있다면 제거
  if (currentMacroChart) {
    currentMacroChart.destroy();
  }

  const ctx = document.getElementById('MacroNutrientsChart').getContext('2d');
  currentMacroChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['탄수화물', '지방', '단백질'],
      datasets: [{
        data: [recipe.carbohydrate, recipe.fat, recipe.protein],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
      },
    }
  });
}

// 레시피 상세 정보 닫기 함수
function closeRecipeDetails() {
  document.querySelector('.right-column').style.display = 'none';
}

// 페이지 로드 시 이벤트 리스너 초기화
document.addEventListener('DOMContentLoaded', () => {
  // 재료 검색 폼 제출 이벤트 처리
  document.getElementById('ingredientForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // 입력된 재료 처리
    const ingredientInput = document.getElementById('ingredients').value;
    const ingredients = ingredientInput.split(',').map(item => item.trim());
    const recipeList = document.getElementById('recipeList');
    
    // 로딩 메시지 표시
    recipeList.innerHTML = '<li>레시피를 검색중입니다...</li>';
    
    try {
      // 서버에 검색 요청
      const response = await fetch('/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients })
      });

      const data = await response.json();
      recipeList.innerHTML = '';

      // 검색 결과 처리 및 표시
      if (data.success && data.recipesByCategory) {
        Object.keys(data.recipesByCategory).forEach(category => {
          const recipes = data.recipesByCategory[category];
          if (recipes.length > 0) {
            // 카테고리 제목 추가
            const categoryTitle = document.createElement('h3');
            categoryTitle.innerText = `${category} 레시피`;
            recipeList.appendChild(categoryTitle);

            // 레시피 리스트 생성
            const categoryList = document.createElement('ul');
            categoryList.classList.add('recipe-list');

            // 각 레시피 항목 추가
            recipes.forEach(recipe => {
              const listItem = document.createElement('li');
              listItem.innerHTML = `<strong>${recipe.name}</strong> - ${recipe.calories} kcal`;
              listItem.onclick = () => showRecipeDetails(recipe);
              categoryList.appendChild(listItem);
            });

            recipeList.appendChild(categoryList);
          }
        });
      } else {
        recipeList.innerHTML = '<li>일치하는 레시피가 없습니다.</li>';
      }
    } catch (error) {
      console.error('레시피 검색 중 오류 발생:', error);
      recipeList.innerHTML = '<li>레시피 검색 중 오류가 발생했습니다.</li>';
    }
  });
}); */