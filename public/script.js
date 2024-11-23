let currentCategory = 'Korean'; // 초기 카테고리 설정
let ingredients = []; // 하나의 전역 배열만 사용
let token = '';
let saveIngredients = [];

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
        removeBtn.onclick = function () {
            list.removeChild(div);
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
    fetchRecipes(currentCategory);
}

async function fetchRecipes(category) {
    const recipeList = document.getElementById('recipe-list');
    recipeList.innerHTML = '';

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
                    <button class="btn btn-outline-secondary btn-sm" onclick="addToFavorites('${recipe._id}')">Add to Favorites</button>
                </div>
            `;
            recipeList.appendChild(li);
        });
    } catch (error) {
        console.error("Error fetching recipes:", error);
    }
}

function showModal(recipe) {
    // 기존 차트가 있다면 제거
    if (window.macroChart) {
        window.macroChart.destroy();
    }

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

    const modal = new bootstrap.Modal(document.getElementById('recipeModal'));
    modal.show();
    
    document.getElementById('modal-instructions').innerText = recipe.instructions ? recipe.instructions.join('\n') : '조리법 정보 없음';

    setTimeout(() => {
        const ctx = document.getElementById('MacroNutrientsChart').getContext('2d');
        window.macroChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['탄수화물', '지방', '단백질'],
                datasets: [{
                    data: [carbohydrate, fat, protein],
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }, 100);

    new bootstrap.Modal(document.getElementById('recipeModal')).show();
}

async function fetchFavorites() {
    try {
        const response = await axios.get('/favorites');
        console.log('Favorites:', response.data);
        // 여기에 즐겨찾기 데이터를 렌더링하는 로직 추가
    } catch (error) {
        console.error('Error fetching favorites:', error.response?.data);
        alert(error.response?.data?.message || 'Error fetching favorites');
    }
}


async function addToFavorites(recipeId) {
    try {
        await axios.post('/favorites', { recipeId });
        showPopup('Recipe added to favorites!');
    } catch (error) {
        showPopup(error.response?.data?.message || 'Error adding to favorites', true);
    }
}

function showPopup(message, isError = false) {
    const popup = document.createElement('div');
    popup.className = `popup-message ${isError ? 'error' : 'success'}`;
    popup.innerText = message;

    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.getElementById('ingredient-input');
    const addButton = document.getElementById('add-ingredient-btn');

    if (inputField) {
        inputField.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                addIngredients(); // 함수 호출
            }
        });
    }

    if (addButton) {
        addButton.addEventListener('click', addIngredients);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const deleteButtons = document.querySelectorAll('.delete-btn');

    deleteButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const recipeId = event.target.dataset.id;

            try {
                // 서버에 DELETE 요청 보내기
                const response = await axios.delete(`/favorites/${recipeId}`);
                if (response.status === 200) {
                    // 성공적으로 삭제되면 해당 li 요소를 DOM에서 제거
                    const li = event.target.closest('li');
                    if (li) {
                        li.remove();
                    } else {
                        console.error('삭제할 항목을 찾을 수 없습니다.');
                    }
                } else {
                    console.error('삭제 실패:', response);
                }
            } catch (error) {
                console.error('즐겨찾기 삭제 중 오류:', error);
                alert('삭제 중 문제가 발생했습니다.');
            }
        });
    });
    document.getElementById('modal-instructions').innerText = recipe.instructions ? recipe.instructions.join('\n') : '조리법 정보 없음';

    new bootstrap.Modal(document.getElementById('recipeModal')).show();
});

async function fetchFavorites() {
    try {
        const response = await axios.get('/favorites');
        console.log('Favorites:', response.data);
        // 여기에 즐겨찾기 데이터를 렌더링하는 로직 추가
    } catch (error) {
        console.error('Error fetching favorites:', error.response?.data);
        alert(error.response?.data?.message || 'Error fetching favorites');
    }
}


async function addToFavorites(recipeId) {
    try {
        await axios.post('/favorites', { recipeId });
        showPopup('Recipe added to favorites!');
    } catch (error) {
        showPopup(error.response?.data?.message || 'Error adding to favorites', true);
    }
}

function showPopup(message, isError = false) {
    const popup = document.createElement('div');
    popup.className = `popup-message ${isError ? 'error' : 'success'}`;
    popup.innerText = message;

    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    const deleteButtons = document.querySelectorAll('.delete-btn');

    deleteButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const recipeId = event.target.dataset.id;

            try {
                // 서버에 DELETE 요청 보내기
                const response = await axios.delete(`/favorites/${recipeId}`);
                if (response.status === 200) {
                    // 성공적으로 삭제되면 해당 li 요소를 DOM에서 제거
                    const li = event.target.closest('li');
                    if (li) {
                        li.remove();
                    } else {
                        console.error('삭제할 항목을 찾을 수 없습니다.');
                    }
                } else {
                    console.error('삭제 실패:', response);
                }
            } catch (error) {
                console.error('즐겨찾기 삭제 중 오류:', error);
                alert('삭제 중 문제가 발생했습니다.');
            }
        });
    });
});
