let currentCategory = 'Korean'; // 초기 카테고리 설정
let ingredients = []; // 하나의 전역 배열만 사용

function activateNav(element) {
    document.querySelectorAll('.navbar .nav-link').forEach(link => link.classList.remove('active'));
    element.classList.add('active');
}

function handleKeyInput(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        addIngredients();
    }
}

function addIngredients() {
    const input = document.getElementById('ingredient-input');
    const list = document.getElementById('ingredient-list');
    const newIngredients = input.value.split(' ').filter(ing => ing.trim() !== '');

    newIngredients.forEach(ingredient => {
        ingredients.push(ingredient); // 전역 배열에 추가

        const div = document.createElement('div');
        div.className = 'ingredient-card';
        div.textContent = ingredient;

        const removeBtn = document.createElement('button');
        removeBtn.textContent = '×';
        removeBtn.onclick = function() {
            list.removeChild(div);
            // 전역 배열에서 해당 재료 삭제
            ingredients = ingredients.filter(item => item !== ingredient);
        };

        div.appendChild(removeBtn);
        list.appendChild(div);
    });

    input.value = '';
    console.log("현재 ingredients 배열:", ingredients); // 배열 업데이트 확인용
}

function showResults() {
    fetchRecipes(currentCategory); // 현재 선택된 카테고리를 사용하여 검색
}

function showCategory(category) {
    currentCategory = category;
    document.querySelectorAll('.nav-tabs .nav-link').forEach(link => link.classList.remove('active'));
    document.querySelector(`.nav-tabs .nav-link[onclick="showCategory('${category}')"]`).classList.add('active');
    fetchRecipes(currentCategory); // 카테고리 변경 시 자동으로 검색 수행
}

async function fetchRecipes(category) {
    const recipeList = document.getElementById('recipe-list');
    recipeList.innerHTML = '';

    console.log("전송되는 재료:", ingredients);
    console.log("전송되는 카테고리:", category);

    try {
        const response = await axios.post('/search', { ingredients, category });
        const recipesByCategory = response.data.recipesByCategory || {};

        const recipes = recipesByCategory[category] || [];

        if (recipes.length === 0) {
            recipeList.innerHTML = `<p>해당 카테고리에 레시피가 없습니다.</p>`;
            return;
        }

        recipes.forEach(recipe => {
            const li = document.createElement('li');
            li.className = 'recipe-card';
            li.innerHTML = `
                <img src="${recipe.image || 'https://via.placeholder.com/80'}" alt="${recipe.name}">
                <div class="recipe-content">
                    <h5>${recipe.name}</h5>
                    <p>${recipe.calories} kcal</p>
                    <p><strong>재료:</strong> ${recipe.ingredients.join(', ')}</p>
                    <button class="btn btn-primary btn-sm" onclick='showModal(${JSON.stringify(recipe)})'>View More</button>
                </div>
            `;
            recipeList.appendChild(li);
        });
    } catch (error) {
        console.error("Error fetching recipes:", error);
    }
}

function showModal(recipe) {
    document.getElementById('modal-image').src = recipe.image || 'https://via.placeholder.com/80';
    document.getElementById('modal-name').innerText = recipe.name || '이름 없음';
    document.getElementById('modal-calories').innerText = recipe.calories || '정보 없음';
    document.getElementById('modal-ingredients').innerText = recipe.ingredients ? recipe.ingredients.join(', ') : '정보 없음';

        const carbohydrate = recipe.carbohydrate || '?';
        const protein = recipe.protein || '?';
        const fat = recipe.fat || '?';

    document.getElementById('modal-nutrients').innerHTML = `
        <li>탄수화물: ${carbohydrate} g</li>
        <li>단백질: ${protein} g</li>
        <li>지방: ${fat} g</li>
    `;
    document.getElementById('modal-instructions').innerText = recipe.instructions ? recipe.instructions.join('\n') : '조리법 정보 없음';

    new bootstrap.Modal(document.getElementById('recipeModal')).show();
}