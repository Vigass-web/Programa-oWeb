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

        sprite.onload = () => {
          function desenhar() {
            // Atualiza posição
            if (teclas.ArrowUp) y -= velocidade;
            if (teclas.ArrowDown) y += velocidade;
            if (teclas.ArrowLeft) x -= velocidade;
            if (teclas.ArrowRight) x += velocidade;

            // Limita para não sair do canvas
            x = Math.max(0, Math.min(canvas.width - 50, x));
            y = Math.max(0, Math.min(canvas.height - 50, y));

            // Limpa canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Desenha personagem
            ctx.drawImage(sprite, x, y, 50, 50);

            // Atualiza e desenha tiros
            for (let i = tiros.length - 1; i >= 0; i--) {
              tiros[i].x += tiros[i].dx;
              tiros[i].y += tiros[i].dy;

              if (tiroImg.complete) {
                ctx.drawImage(tiroImg, tiros[i].x, tiros[i].y, tiros[i].largura, tiros[i].altura);
              } else {
                // fallback se a imagem não carregou ainda
                ctx.fillStyle = 'yellow';
                ctx.fillRect(tiros[i].x, tiros[i].y, tiros[i].largura, tiros[i].altura);
              }

              // Remove tiro fora da tela
              if (
                tiros[i].x < 0 || tiros[i].x > canvas.width ||
                tiros[i].y < 0 || tiros[i].y > canvas.height
              ) {
                tiros.splice(i, 1);
              }
            }

            requestAnimationFrame(desenhar);
          }
          desenhar();
        };
      }
    });