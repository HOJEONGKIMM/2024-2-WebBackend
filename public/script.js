let currentCategory = 'Korean'; // 초기 카테고리 설정
let ingredients = []; // 하나의 전역 배열만 사용
let token = '';
let saveIngredients = [];

// 네비게이션 활성화
function activateNav(element) {
    document.querySelectorAll('.navbar .nav-link').forEach(link => link.classList.remove('active'));
    element.classList.add('active');
}

// Enter 키 입력 처리
function handleKeyInput(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        addIngredients();
    }
}

// 재료 추가
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

// 결과 표시
function showResults() {
    fetchRecipes(currentCategory); // 현재 선택된 카테고리를 사용하여 검색
}

// 카테고리 변경
function showCategory(category) {
    currentCategory = category;
    document.querySelectorAll('.nav-tabs .nav-link').forEach(link => link.classList.remove('active'));
    document.querySelector(`.nav-tabs .nav-link[onclick="showCategory('${category}')"]`).classList.add('active');
    fetchRecipes(currentCategory);
}

// 레시피 데이터 가져오기
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

// 모달 표시
function showModal(recipe) {
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
}

// 즐겨찾기 데이터 가져오기
async function fetchFavorites() {
    try {
        const response = await axios.get('/favorites');
        console.log('Favorites:', response.data);
    } catch (error) {
        console.error('Error fetching favorites:', error.response?.data);
        alert(error.response?.data?.message || 'Error fetching favorites');
    }
}

// 즐겨찾기 추가
async function addToFavorites(recipeId) {
    try {
        await axios.post('/favorites', { recipeId });
        showPopup('Recipe added to favorites!');
    } catch (error) {
        showPopup(error.response?.data?.message || 'Error adding to favorites', true);
    }
}

// 팝업 메시지 표시
function showPopup(message, isError = false) {
    const popup = document.createElement('div');
    popup.className = `popup-message ${isError ? 'error' : 'success'}`;
    popup.innerText = message;

    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 3000);
}

// 삭제 버튼 이벤트
document.addEventListener('DOMContentLoaded', () => {
    const deleteButtons = document.querySelectorAll('.delete-btn');

    deleteButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const recipeId = event.target.dataset.id;

            try {
                const response = await axios.delete(`/favorites/${recipeId}`);
                if (response.status === 200) {
                    const li = event.target.closest('li');
                    if (li) {
                        li.remove();
                    }
                }
            } catch (error) {
                console.error('즐겨찾기 삭제 중 오류:', error);
                alert('삭제 중 문제가 발생했습니다.');
            }
        });
    });
});
