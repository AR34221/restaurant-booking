// public/js/booking.js

document.addEventListener('DOMContentLoaded', () => {
  const dateSelect = document.getElementById('date');
  const timeSelect = document.getElementById('time');
  const hallGrids  = document.querySelectorAll('.hall-grid');

  const modal      = document.getElementById('bookingModal');
  const closeBtn   = document.querySelector('.close');
  const bookBtn    = document.getElementById('bookButton');
  const successMsg = document.getElementById('successMessage');

  let allTables = [];

  // 1) Сгенерировать даты
  function generateDates() {
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const opt = document.createElement('option');
      opt.value       = d.toISOString().split('T')[0]; // YYYY-MM-DD
      opt.textContent = d.toLocaleDateString('ru-RU', {
        weekday: 'short', day: 'numeric', month: 'long'
      });
      dateSelect.appendChild(opt);
    }
    dateSelect.selectedIndex = 0;
  }

  // 2) Сгенерировать временные слоты с фильтрацией прошедших
  function populateTimes() {
    timeSelect.innerHTML = '';
    const selectedDate = dateSelect.value;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const isToday = selectedDate === today;

    for (let h = 10; h < 22; h += 2) {
      const from = `${h.toString().padStart(2, '0')}:00`;
      const to   = `${(h + 1).toString().padStart(2, '0')}:30`;
      if (isToday) {
        const [toH, toM] = to.split(':').map(Number);
        const endDateTime = new Date(now);
        endDateTime.setHours(toH, toM, 0, 0);
        if (endDateTime <= now) continue;
      }
      const opt = document.createElement('option');
      opt.value = `${from} - ${to}`;
      opt.textContent = `${from} - ${to}`;
      timeSelect.appendChild(opt);
    }
    timeSelect.selectedIndex = 0;
  }

  // 3) Загрузить все столы
  async function loadTables() {
    try {
      const res  = await fetch('/api/tables');
      const json = await res.json();
      allTables = json.tables;
      updateTableDisplay();
    } catch (err) {
      console.error('Ошибка загрузки столов', err);
    }
  }

  // 4) Обновить отображение столов
  async function updateTableDisplay() {
    const date = dateSelect.value;
    const time = timeSelect.value;
    hallGrids.forEach(grid => grid.innerHTML = '');
    if (!date || !time || !allTables.length) return;

    try {
      const res    = await fetch(
        `/api/tables/booked?date=${date}&time=${encodeURIComponent(time)}`
      );
      const json   = await res.json();
      const booked = json.booked;

      allTables.forEach(table => {
        const div = document.createElement('div');
        div.classList.add('table', booked.includes(table.id) ? 'busy' : 'free');
        div.dataset.id    = table.id;
        div.dataset.seats = table.seats;

        const loc = table.location.trim().toLowerCase();
        const container = Array.from(hallGrids).find(g =>
          g.dataset.location.trim().toLowerCase() === loc
        );
        if (!container) return;
        container.appendChild(div);

        const img = document.createElement('img');
        img.classList.add('table-img');
        img.src = `/img/Table_${table.id}_${booked.includes(table.id) ? 'Red' : 'Green'}.png`;
        img.alt = `Стол ${table.id}`;
        div.appendChild(img);

        div.addEventListener('click', () => {
          document.getElementById('tableNumber').innerText  = `Стол ${table.id}`;
          const seats = table.seats;
          const word  = seats === 6 ? 'мест' : 'места';
          document.getElementById('tableSeats').innerText = `${seats} ${word}`;

          const rawDate = date;
          const dt = new Date(rawDate + 'T00:00');
          const formatted = dt.toLocaleDateString('ru-RU', {
            day: '2-digit', month: '2-digit', year: 'numeric'
          });
          document.getElementById('selectedDate').innerText = formatted;

          document.getElementById('selectedTime').innerText = time;
          document.getElementById('tableImage').src = `/img/Table_${seats}.png`;

          if (booked.includes(table.id)) {
            bookBtn.style.display    = 'none';
            successMsg.style.display = 'block';
            successMsg.innerHTML = '<span class="success-main">Стол уже забронирован</span>';
          } else {
            bookBtn.style.display    = 'block';
            successMsg.style.display = 'none';
          }

          modal.style.display = 'flex';
        });
      });
    } catch (err) {
      console.error('Ошибка загрузки занятых столов', err);
    }
  }

  // 5) Бронирование
  bookBtn.addEventListener('click', async () => {
    const tableId     = +document.getElementById('tableNumber').innerText.split(' ')[1];
    const bookingDate = dateSelect.value;
    const bookingTime = document.getElementById('selectedTime').innerText;
    try {
      const res = await fetch('/api/book', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ table_id: tableId, booking_date: bookingDate, booking_time: bookingTime })
      });
      if (res.status === 401) {
        successMsg.style.display = 'block';
        successMsg.innerText     = 'Войдите в личном кабинете, чтобы забронировать стол';
        return;
      }
      const json = await res.json();
      if (json.success) {
        bookBtn.style.display    = 'none';
        successMsg.style.display = 'block';
        successMsg.innerHTML = '<span class="success-main">Успешно забронировано!</span><br><span class="success-sub">Отменить бронь можно в личном кабинете</span>';
        updateTableDisplay();
      } else {
        successMsg.style.display = 'block';
        successMsg.innerText     = `Ошибка: ${json.error}`;
      }
    } catch (err) {
      successMsg.style.display = 'block';
      successMsg.innerText     = 'Войдите в аккаунт в личном кабинете, чтобы забронировать';
    }
  });

  closeBtn.addEventListener('click', () => { modal.style.display = 'none'; });

  dateSelect.addEventListener('change', () => {
    populateTimes();
    updateTableDisplay();
  });

  // initial
  generateDates();
  populateTimes();
  loadTables();
  modal.style.display = 'none';
});
