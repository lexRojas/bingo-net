export default class GeneradorNumeros {
  private numerosRestantes: number[] = [];

  constructor() {
    this.reiniciar();
  }

  // Reinicia el array de números del 1 al 75
  public reiniciar() {
    this.numerosRestantes = [];
    for (let i = 1; i <= 75; i++) {
      this.numerosRestantes.push(i);
    }
  }

  // Genera un número aleatorio del 1 al 75 sin repetir
  generarNumero(): number | null {
    if (this.numerosRestantes.length === 0) {
      return null; // Todos los números han sido generados
    }

    const indiceAleatorio = Math.floor(
      Math.random() * this.numerosRestantes.length
    );
    const numeroSeleccionado = this.numerosRestantes[indiceAleatorio];

    // Elimina el número seleccionado del array
    this.numerosRestantes.splice(indiceAleatorio, 1);

    return numeroSeleccionado;
  }
}
