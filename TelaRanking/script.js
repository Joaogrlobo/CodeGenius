
const isLoggedIn = true; 


const users = [
  { name: "You", score: 30, change: "up", isCurrentUser: true },
  { name: "Martha Anderson", score: 20, change: "up", isCurrentUser: false },
  { name: "Julia Clover", score: 10, change: "down", isCurrentUser: false },
];

const container = document.getElementById("rankingList");

users.forEach(user => {
  const div = document.createElement("div");
  div.classList.add("ranking-item");
  if (isLoggedIn && user.isCurrentUser) {
    div.classList.add("logged");
  }

  div.innerHTML = `
    <div class="ranking-info">
      <img src="https://via.placeholder.com/30" alt="${user.name}">
      <div>
        <strong>${user.name}</strong><br>
        <small>${user.score} pt</small>
      </div>
    </div>
    <div class="arrow ${user.change === 'up' ? 'up' : 'down'}">
      ${user.change === 'up' ? '▲' : '▼'}
    </div>
  `;

  container.appendChild(div);
});
