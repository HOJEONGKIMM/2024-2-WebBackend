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
