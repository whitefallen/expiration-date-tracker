import Quagga from '@ericblade/quagga2';

export interface BarcodeResult {
  code: string;
  format: string;
}

export class BarcodeScanner {
  static async initialize(
    containerElement: HTMLElement,
    onDetected: (result: BarcodeResult) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      Quagga.init(
        {
          inputStream: {
            name: 'Live',
            type: 'LiveStream',
            target: containerElement,
            constraints: {
              width: { min: 640 },
              height: { min: 480 },
              facingMode: 'environment',
            },
          },
          decoder: {
            readers: [
              'ean_reader',
              'ean_8_reader',
              'code_128_reader',
              'code_39_reader',
              'upc_reader',
              'upc_e_reader',
            ],
          },
          locate: true,
        },
        (err) => {
          if (err) {
            reject(err);
            return;
          }
          Quagga.start();
          resolve();
        }
      );

      Quagga.onDetected((result) => {
        if (result.codeResult && result.codeResult.code) {
          onDetected({
            code: result.codeResult.code,
            format: result.codeResult.format || 'unknown',
          });
        }
      });
    });
  }

  static stop(): void {
    Quagga.stop();
  }
}
