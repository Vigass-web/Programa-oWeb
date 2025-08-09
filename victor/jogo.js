document.addEventListener('DOMContentLoaded', () => {
  const telaInicio = document.getElementById('tela-inicial');
  const telaSelecao = document.getElementById('selecao-personagem');
  const telaJogo = document.getElementById('jogo');

  // Pressionar ESPAÇO → some tela inicial e aparece seleção
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      telaInicio.style.opacity = 0;

      setTimeout(() => {
        telaInicio.style.display = 'none';
        telaSelecao.style.display = 'block';
      }, 700);
    }
  });

  // Clique na imagem do personagem seleciona e inicia o jogo
  const personagens = document.querySelectorAll('.card-personagem');
  personagens.forEach(img => {
    img.addEventListener('click', () => {
      const personagem = img.getAttribute('data-personagem');
      console.log('Personagem escolhido:', personagem);

      telaSelecao.style.display = 'none';
      telaJogo.style.display = 'flex';

      iniciarJogo(personagem);
    });
  });

  function iniciarJogo(personagem) {
    const canvas = document.getElementById('canvas-jogo');
    const ctx = canvas.getContext('2d');

    let x = 100;
    let y = 100;
    const larguraPlayer = 50;
    const alturaPlayer = 50;
    const velocidade = 5;

    let direction = 'right'; // direção inicial do personagem ('up','down','left','right')

    let sprite = new Image();

    switch (personagem) {
      case 'char1':
        sprite.src = 'new_grass_pokemon_grookey_pixel_art_by_hephaestu5_dd0wz5f-fullview-removebg-preview.png';
        break;
      case 'char2':
        sprite.src = '022_Leafeon.webp';
        break;
      case 'char3':
        sprite.src = '226_Bulbasaur-removebg-preview.png';
        break;
      default:
        sprite.src = '';
    }

    // Estado das teclas
    const teclas = {
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false,
    };

    window.addEventListener('keydown', (e) => {
      if (teclas.hasOwnProperty(e.code)) {
        teclas[e.code] = true;

        // Atualiza direção na última tecla pressionada
        if (e.code === 'ArrowUp') direction = 'up';
        else if (e.code === 'ArrowDown') direction = 'down';
        else if (e.code === 'ArrowLeft') direction = 'left';
        else if (e.code === 'ArrowRight') direction = 'right';
      }

      // Atira com a tecla "Z"
      if (e.code === 'KeyZ') {
        e.preventDefault();
        // Cria o tiro na posição do personagem na direção atual
        let tiroX = x + 25; // centro horizontal do personagem
        let tiroY = y + 25; // centro vertical do personagem
        let dx = 0;
        let dy = 0;
        const velocidadeTiro = 10;

        switch (direction) {
          case 'up':
            dy = -velocidadeTiro;
            tiroY = y; // parte de cima do personagem
            tiroX = x + 20;
            break;
          case 'down':
            dy = velocidadeTiro;
            tiroY = y + 50;
            tiroX = x + 20;
            break;
          case 'left':
            dx = -velocidadeTiro;
            tiroX = x;
            tiroY = y + 20;
            break;
          case 'right':
            dx = velocidadeTiro;
            tiroX = x + 50;
            tiroY = y + 20;
            break;
        }

        tiros.push({ x: tiroX, y: tiroY, dx, dy, largura: 20, altura: 20 });
      }
    });

    window.addEventListener('keyup', (e) => {
      if (teclas.hasOwnProperty(e.code)) {
        teclas[e.code] = false;
      }
    });

    let tiros = [];
    let tiroImg = new Image();
    tiroImg.src = 'folha.png';

    // ** NOVAS VARIÁVEIS PARA VIDA, NPCs E TIMER **
    let playerHealth = 100;
    const maxHealth = 100;

    let tempo = 0;

    const npcs = [];
    const npcSize = 40;
    const npcSpeed = 2;

    // Função para criar NPCs iniciais em posições aleatórias distantes do jogador
    function criarNPCs(qtd) {
      for (let i = 0; i < qtd; i++) {
        criarNPC();
      }
    }

    // Função para criar um único NPC em posição aleatória distante do jogador
    function criarNPC() {
      let npcX, npcY;
      do {
        npcX = Math.random() * (canvas.width - npcSize);
        npcY = Math.random() * (canvas.height - npcSize);
      } while (Math.abs(npcX - x) < 100 && Math.abs(npcY - y) < 100);
      npcs.push({ x: npcX, y: npcY, width: npcSize, height: npcSize });
    }

    criarNPCs(3);

    // Cria 2 NPCs novos a cada 1 segundo
    const criarNPCInterval = setInterval(() => {
      if (playerHealth > 0) { // só cria se jogador estiver vivo
        criarNPC();
        criarNPC();
      } else {
        clearInterval(criarNPCInterval); // para de criar NPCs quando jogador morrer
      }
    }, 1000);

    // Função para distância
    function distancia(a, b) {
      return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
    }

    // Move NPCs na direção do jogador
    function moverNPCs() {
      for (const npc of npcs) {
        let dx = x - npc.x;
        let dy = y - npc.y;
        let dist = distancia(npc, { x, y });
        if (dist > 0) {
          npc.x += (dx / dist) * npcSpeed;
          npc.y += (dy / dist) * npcSpeed;
        }
      }
    }

    // Colisão retangular
    function colisao(a, b) {
      return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
      );
    }

    // Verifica se NPC colidiu com jogador e reduz vida
    function verificarDano() {
      const playerBox = { x, y, width: larguraPlayer, height: alturaPlayer };
      for (const npc of npcs) {
        if (colisao(playerBox, npc)) {
          playerHealth -= 1;
          if (playerHealth < 0) playerHealth = 0;
        }
      }
    }

    // Verifica se tiro atingiu NPC, remove ambos
    function verificarTiros() {
      for (let i = npcs.length - 1; i >= 0; i--) {
        const npc = npcs[i];
        for (let j = tiros.length - 1; j >= 0; j--) {
          const tiro = tiros[j];
          const tiroBox = { x: tiro.x, y: tiro.y, width: tiro.largura, height: tiro.altura };
          if (colisao(npc, tiroBox)) {
            npcs.splice(i, 1);
            tiros.splice(j, 1);
            break;
          }
        }
      }
    }

    // Desenha barra de vida no topo esquerdo
    function desenharBarraVida() {
      const barraX = 10;
      const barraY = 10;
      const barraLargura = 200;
      const barraAltura = 20;

      ctx.fillStyle = 'red';
      ctx.fillRect(barraX, barraY, barraLargura, barraAltura);

      const vidaLargura = (playerHealth / maxHealth) * barraLargura;
      ctx.fillStyle = 'green';
      ctx.fillRect(barraX, barraY, vidaLargura, barraAltura);

      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.strokeRect(barraX, barraY, barraLargura, barraAltura);
    }

    // Desenha timer no topo direito
    function desenharTimer() {
      ctx.fillStyle = 'black';
      ctx.font = '20px Arial';
      ctx.fillText(`Tempo: ${tempo}s`, canvas.width - 120, 30);
    }

    sprite.onload = () => {
      const interval = setInterval(() => {
        tempo++;
      }, 1000);

      function desenhar() {
        // Atualiza posição do player só se estiver vivo
        if (playerHealth > 0) {
          if (teclas.ArrowUp) y -= velocidade;
          if (teclas.ArrowDown) y += velocidade;
          if (teclas.ArrowLeft) x -= velocidade;
          if (teclas.ArrowRight) x += velocidade;

          x = Math.max(0, Math.min(canvas.width - larguraPlayer, x));
          y = Math.max(0, Math.min(canvas.height - alturaPlayer, y));
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Move e desenha NPCs se jogador vivo
        if (playerHealth > 0) {
          moverNPCs();
        }
        for (const npc of npcs) {
          ctx.fillStyle = 'purple';
          ctx.fillRect(npc.x, npc.y, npc.width, npc.height);
        }

        // Atualiza e desenha tiros
        for (let i = tiros.length - 1; i >= 0; i--) {
          tiros[i].x += tiros[i].dx;
          tiros[i].y += tiros[i].dy;

          if (tiroImg.complete) {
            ctx.drawImage(tiroImg, tiros[i].x, tiros[i].y, tiros[i].largura, tiros[i].altura);
          } else {
            ctx.fillStyle = 'yellow';
            ctx.fillRect(tiros[i].x, tiros[i].y, tiros[i].largura, tiros[i].altura);
          }

          if (
            tiros[i].x < 0 || tiros[i].x > canvas.width ||
            tiros[i].y < 0 || tiros[i].y > canvas.height
          ) {
            tiros.splice(i, 1);
          }
        }

        verificarTiros();

        if (playerHealth > 0) {
          ctx.drawImage(sprite, x, y, larguraPlayer, alturaPlayer);
        }

        if (playerHealth > 0) {
          verificarDano();
        }

        desenharBarraVida();
        desenharTimer();

        if (playerHealth <= 0) {
          ctx.fillStyle = 'black';
          ctx.font = '50px Arial';
          ctx.fillText('Você morreu!', canvas.width / 2 - 130, canvas.height / 2);
          clearInterval(interval);
        } else {
          requestAnimationFrame(desenhar);
        }
      }

      desenhar();
    };
  }
});
