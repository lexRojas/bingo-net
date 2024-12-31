'use client'

import styles from '@/modules/bingo.module.css'
import { alias } from '@/components/numeros'
import { useRef, useState } from 'react'
import generaPartida from '@/api/generadorPalabras'
import Ably from 'ably'
import GeneradorNumeros from '@/components/generador'

const client = new Ably.Realtime({
  key: process.env.NEXT_PUBLIC_API_WEBSOCKET,
});

export default function Home() {

  const [selected, setSelected] = useState<boolean[]>(Array.from({ length: 75 }, () => false))
  const [numeroSeleccionado, setNumeroSeleccionado] = useState<number[]>([])
  const [numeroAlias, setNumeroAlias] = useState<number>(0)
  const [errorNumero, setErrorNumero] = useState<boolean>(false)
  const [valor, setValor] = useState<number>(1)
  const [partida, setPartida] = useState<string | null>(null)
  const [showdialog, setShowDialog] = useState<boolean>(false)
  const [modoCliente, setModoCliente] = useState<boolean>(false)
  const [conectado, setConectado] = useState<boolean>(false)

  const gen: GeneradorNumeros = new GeneradorNumeros();

  const numero_digitado = useRef(null)
  const partida_suscribir = useRef<HTMLInputElement>(null)

  const channel = client.channels.get("bingonet");


  client.connection.on("connected", () => {
    console.log("Conectado a Ably");
  });


  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key == "Enter") {
      if (numero_digitado.current) {
        const { value } = numero_digitado.current
        const n = Number(value).valueOf()

        aplicarNumero(n)
      }
    }
  }


  const clickSiguiente = () => {

    const bolita = gen.generarNumero()
    console.log(bolita)

    if (bolita) {
      setNumeroAlias(bolita)
      aplicarNumero(bolita)
    }

  }
  const aplicarNumero = (n: number) => {


    if (n >= 1 && n <= 75) {
      const newArray = numeroSeleccionado
      const newArraySelected = selected

      newArraySelected[n - 1] = true
      newArray.push(n)

      setNumeroSeleccionado(newArray)
      setNumeroAlias(n)
      setErrorNumero(false)
      setSelected(newArraySelected)

      if (!modoCliente) {
        publicarNumero(n)
      }

      const input: HTMLInputElement = numero_digitado.current!
      input.select()
    } else {

      setErrorNumero(true)
    }
  }


  const publicarNumero = (n: number) => {
    if (channel && partida) {
      channel.publish(partida, { value: n });
    }
  }


  const playAgaint = () => {

    const newArray: number[] = []
    const newArraySelected: boolean[] = Array.from({ length: 75 }, () => false)

    gen.reiniciar()

    setNumeroSeleccionado(newArray)
    setSelected(newArraySelected)
    setNumeroAlias(0)
    setValor(1)

  }


  const generarNumeros = (inicio: number) => {
    return (
      Array.from({ length: 15 }, (_, i) => (
        <div
          key={i + inicio}
          id={`b${i + inicio}`}
          className={!selected[i + (inicio - 1)] ? styles.numero : styles.numero_selected}
        >
          {i + inicio}
        </div>
      ))

    )

  }

  const generarPartida = async () => {

    const palabra = await generaPartida()

    // channel.subscribe(palabra, (message) => {
    //   console.log('Recibido mensaje en el tópico:', message.name, message.data);
    // });

    setPartida(palabra)
    setModoCliente(false)

  }


  const suscribirPartida = () => {

    setShowDialog(true)






  }


  const suscribirCliente = () => {
    const palabra = partida_suscribir.current?.value

    if (palabra) {

      setPartida(palabra.toUpperCase())

      channel.subscribe(palabra.toUpperCase(), (message) => {
        console.log('Recibido mensaje en el tópico:', message.name, message.data);
        console.log(modoCliente)

        if (modoCliente) {
          const { value } = message.data
          const numero = parseInt(value)
          aplicarNumero(numero)
        }
      });

      setModoCliente(true)
      setShowDialog(false)
      setConectado(true)
    } else {
      console.log("palabra no existe")
    }
    console.log(palabra)
    console.log('MODO DE CLIENTE--->>>')
    console.log(modoCliente)

  }




  return (

    <div className="container mx-auto">

      <div className="flex flex-col  gap-4   md:grid grid-cols-5   md:grid-rows-[auto_auto_auto]   ">
        <div className="flex  mt-2 md:col-span-3  justify-center " >
          <span className='text-red-600  text-8xl font-[family-name:var(--font-bingo)] '>
            B
          </span>
          <span className='text-green-500 text-8xl font-[family-name:var(--font-bingo)] '>
            I
          </span>
          <span className='text-blue-950 text-8xl font-[family-name:var(--font-bingo)] '>
            N
          </span>
          <span className='text-yellow-600 text-8xl font-[family-name:var(--font-bingo)] '>
            G
          </span>
          <span className='text-purple-900 text-8xl font-[family-name:var(--font-bingo)] '>
            O
          </span>
        </div>
        <div className="flex flex-col rounded-xl mt-2 items-center align-middle justify-center text-4xl  text-white font-bold bg-blue-500 md:col-span-2   " >

          <p>Partida: {partida} </p>
          {conectado && <span>Conectado!</span>}
        </div>
        <div className="flex items-center justify-center  md:col-span-2   md:col-start-4">
          <div className={styles.bola}>
            <p className='flex'>{numeroAlias}</p>
          </div>
        </div>


        <div className="flex md:col-span-3  md:row-start-2 justify-center">
          <div className="grid grid-cols-5 gap-4 text-center">
            {/* Columna B */}
            <div className="">
              <div className="px-3 font-bold text-xl mb-2">B</div>
              {generarNumeros(1)}
            </div>
            {/* Columna I */}
            <div>
              <div className="font-bold text-xl mb-2">I</div>
              {generarNumeros(16)}
            </div>
            {/* Columna N */}
            <div>
              <div className="font-bold text-xl mb-2">N</div>
              {generarNumeros(31)}
            </div>
            {/* Columna G */}
            <div>
              <div className="font-bold text-xl mb-2">G</div>
              {generarNumeros(46)}
            </div>
            {/* Columna O */}
            <div>
              <div className="font-bold text-xl mb-2">O</div>
              {generarNumeros(61)}
            </div>
          </div>


        </div>
        <div className="flex rounded-xl gap-2 justify-center md:col-span-2  bg-green-500 md:row-start-3">

          <button className='bg-red-400 hover:bg-yellow-700 text-gray-800 font-semibold py-2 px-2 my-2 border border-gray-400 rounded-xl shadow '
            onClick={playAgaint}>
            Jugar de nuevo
          </button>

          <button className='bg-yellow-400 hover:bg-yellow-700 text-gray-800 font-semibold py-2 px-2 my-2 border border-gray-400 rounded-xl shadow '
            onClick={generarPartida}>
            Generar Partida
          </button>


          <button className='bg-purple-400 hover:bg-yellow-700 text-gray-800 font-semibold py-2 px-2 my-2 border border-gray-400 rounded-xl shadow '
            onClick={suscribirPartida}>
            Suscribir Partida
          </button>


        </div>
        <div className="flex  rounded-xl md:col-start-3 bg-yellow-300 md:row-start-3">

          <div className='flex md:flex-row flex-col w-full p-3 m-2 mx-auto gap-2  items-center'>

            <div className=''>
              <label className="" htmlFor="numero">Numero:</label>
              <input className='text-center'
                type="number"
                name="numero"
                id="numero"
                disabled
                min={1}
                max={75}
                ref={numero_digitado}
                onKeyDown={handleKeyPress}
                value={valor}
                onChange={(e) => setValor(Number(e.target.value).valueOf())} />
            </div>

            <button onClick={clickSiguiente} className='bg-blue-900 rounded-lg shadow-md text-white  p-5 w-full md:p-2' disabled={modoCliente}> Siguiente </button>

          </div>



        </div>
        <div className="flex rounded-xl items-center align-middle justify-center text-2xl font-bold md:col-start-4 md:col-span-2 bg-purple-400 md:row-start-3">

          {!errorNumero ? (
            numeroAlias >= 1 ? (
              <span> {alias.numerosBingo?.find(item => item.numero == numeroAlias)?.nombre || ""} </span>
            ) : null
          ) : (
            <span className='text-red-600 text-2xl '> NUMERO NO PERMITIDO </span>
          )
          }
        </div>


        {showdialog && <div className='flex flex-col p-4  border-2 border-blue-950  shadow-xl  fixed top-1/2 -translate-x-1/2 left-1/2  -translate-y-1/2 bg-yellow-200 rounded-lg'>

          <p>Digite el nombre de la partida</p>
          <input ref={partida_suscribir} className='text-xl   text-center mt-2' type="text" name="partida" id="partida" />
          <button
            onClick={suscribirCliente}
            className='p-2 border-1 shadow-lg bg-green-900 rounded-md mt-2 text-white font-bold' >Suscribirme</button>



        </div>
        }


      </div>


    </div>

  );
}
