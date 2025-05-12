// Скрыть модальное окно по умолчанию
const modal = document.getElementById('modal');
const closeButton = document.querySelector('.close-button');
const bookButton = document.getElementById('book-button');

// Данные для столов
const tables = {
    1: { seats: '2 места', img: '../img/Table_2.png', status: 'green' },
    2: { seats: '2 места', img: '../img/Table_2.png', status: 'green' },
    3: { seats: '2 места', img: '../img/Table_2.png', status: 'green' },
    4: { seats: '4 места', img: '../img/Table_4.png', status: 'green' },
    // Добавьте остальные столы
};

// Открытие модального окна при клике на стол
const tableElements = document.querySelectorAll('.table');

tableElements.forEach(table => {
    table.addEventListener('click', function() {
        const tableId = table.id.replace('table', '');
        const tableData = tables[tableId];

        // Заполнение модального окна
        document.getElementById('table-img').src = tableData.img;
        document.getElementById('table-title').textContent = `Стол ${tableId}`;
        document.getElementById('table-seats').textContent = tableData.seats;
        document.getElementById('table-description').textContent = 'Таблица доступна для бронирования.';
        document.getElementById('table-date').textContent = '26.04.2025'; // Можно динамически менять
        document.getElementById('table-time').textContent = '18:00 - 19:30'; // Можно динамически менять

        // Показать модальное окно
        modal.style.display = 'block';
    });
});

// Закрытие модального окна
closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Обработчик на кнопку бронирования
bookButton.addEventListener('click', () => {
    bookButton.textContent = 'Успешно забронировано!';
    bookButton.disabled = true;
});
