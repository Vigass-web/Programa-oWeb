document.addEventListener('keydown', function(event) {
  if(event.code === 'Space') {
    event.preventDefault();
    const telaInicio = document.getElementById('tela-inicio');
    telaInicio.classList.remove('opacity-100');
    telaInicio.classList.add('opacity-0');

    setTimeout(() => {
      telaInicio.style.display = 'none';
      iniciarJogo();
    }, 700);
  }
});
