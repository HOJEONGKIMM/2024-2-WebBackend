document.getElementById('ingredientForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const ingredientInput = document.getElementById('ingredients').value;
  const ingredients = ingredientInput.split(',').map(item => item.trim());
  const recipeList = document.getElementById('recipeList');
  
  // 로딩 메시지 표시
  recipeList.innerHTML = '<li>Loading recipes...</li>';

  try {
    const response = await fetch('/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ingredients })
    });

    const data = await response.json();
    recipeList.innerHTML = '';

    if (data.success && data.recipes.length > 0) {
      data.recipes.forEach(recipe => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
          <strong>${recipe.name}</strong> - ${recipe.calories} kcal<br>
          <em>Instructions:</em> ${recipe.instructions}
        `;
        recipeList.appendChild(listItem);
      });
    } else {
      recipeList.innerHTML = '<li>No matching recipes found.</li>';
    }
  } catch (error) {
    console.error('Error fetching recipes:', error);
    recipeList.innerHTML = '<li>Error fetching recipes</li>';
  }
});
