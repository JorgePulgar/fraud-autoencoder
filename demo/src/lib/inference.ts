import * as ort from 'onnxruntime-web'

export type { InferenceSession } from 'onnxruntime-web'

export async function loadModel(url: string): Promise<ort.InferenceSession> {
  const session = await ort.InferenceSession.create(url, {
    executionProviders: ['wasm'],
  })
  console.log('[ORT] inputNames:', session.inputNames)
  console.log('[ORT] outputNames:', session.outputNames)
  return session
}

export async function runInference(
  session: ort.InferenceSession,
  scaledFeatures: number[],
): Promise<Float32Array> {
  const inputName = session.inputNames[0]
  const outputName = session.outputNames[0]

  const tensor = new ort.Tensor(
    'float32',
    Float32Array.from(scaledFeatures),
    [1, 30],
  )
  const outputs = await session.run({ [inputName]: tensor })
  return outputs[outputName].data as Float32Array
}
