# Genera los audios pregrabados de la app una sola vez, en local, con Piper (voz es_AR "daniela", licencia CC BY-SA 4.0).
# Salida: public/audio/<clave>.mp3. Los nombres de archivo son las claves que usan los bloques (ver docs/bloques.md).
#
# Uso (desde la carpeta you-school):
#   python database/generar-audio.py --piper "C:/Users/user/pv/Scripts/python.exe" --modelo "C:/Users/user/pv/models/es_AR-daniela-high.onnx" --ffmpeg "C:/ruta/ffmpeg.exe"
#   Agregar --solo-muestras para generar tres muestras en una carpeta temporal.
import argparse
import os
import subprocess
import tempfile

NUMEROS = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez',
           'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte']

# Frases de las explicaciones del piloto (claves usadas en el campo "audio" de los bloques).
FRASES = {
    'frase-despues-del-6': 'Después del seis viene el siete. Contamos: cinco, seis, siete.',
    'frase-hoy-contamos-del-1-al-10': 'Hoy contamos del uno al diez.',
}

MUESTRAS = [
    'Contemos juntos del uno al diez.',
    'Después del seis viene el siete.',
    '¡Muy bien! Ya sabés contar hasta el diez.',
]


def sintetizar(piper, modelo, texto, destino_wav):
    # Piper lee el texto por entrada estándar.
    subprocess.run([piper, '-m', 'piper', '-m', modelo, '-f', destino_wav], input=texto.encode('utf-8'), check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def a_mp3(ffmpeg, origen_wav, destino_mp3):
    # Mono, 48 kbps: livianos para la web.
    subprocess.run([ffmpeg, '-y', '-loglevel', 'error', '-i', origen_wav, '-ac', '1', '-b:a', '48k', destino_mp3], check=True)


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--piper', required=True, help='Python del entorno donde está piper-tts')
    p.add_argument('--modelo', required=True, help='Archivo .onnx de la voz')
    p.add_argument('--ffmpeg', required=True)
    p.add_argument('--solo-muestras', action='store_true')
    args = p.parse_args()

    if args.solo_muestras:
        destino = tempfile.mkdtemp(prefix='muestras-')
        for i, texto in enumerate(MUESTRAS, 1):
            wav = os.path.join(destino, f'muestra-{i}.wav')
            sintetizar(args.piper, args.modelo, texto, wav)
            a_mp3(args.ffmpeg, wav, os.path.join(destino, f'muestra-{i}.mp3'))
        print('Muestras en', destino)
        return

    salida = os.path.join(os.path.dirname(__file__), '..', 'public', 'audio')
    os.makedirs(salida, exist_ok=True)
    trabajo = tempfile.mkdtemp(prefix='audio-')
    clips = {f'numero-{n}': palabra for n, palabra in enumerate(NUMEROS)}
    clips.update(FRASES)
    for clave, texto in clips.items():
        wav = os.path.join(trabajo, clave + '.wav')
        sintetizar(args.piper, args.modelo, texto, wav)
        a_mp3(args.ffmpeg, wav, os.path.join(salida, clave + '.mp3'))
        print('ok', clave)


if __name__ == '__main__':
    main()
