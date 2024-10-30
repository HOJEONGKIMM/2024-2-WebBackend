document.getElementById('ingredientForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // 폼의 기본 제출 이벤트를 막음
  
    const ingredientInput = document.getElementById('ingredients').value;
    const ingredients = ingredientInput.split(',').map(item => item.trim()); // 입력된 재료 리스트 생성
  
    try {
      const response = await fetch('/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ingredients })
      });
  
      const data = await response.json();
  
      if (data.success) {
        const recipeList = document.getElementById('recipeList');
        recipeList.innerHTML = ''; // 이전 검색 결과 초기화
  
        data.recipes.forEach(recipe => {
          const listItem = document.createElement('li');
          listItem.innerHTML = `<strong>${recipe.name}</strong> - ${recipe.calories} kcal<br>${recipe.instructions}`;
          recipeList.appendChild(listItem);
        });
      } else {
        alert('No recipes found');
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  });
  