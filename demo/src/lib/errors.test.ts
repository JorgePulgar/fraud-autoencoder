import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { reconstructionError } from './errors'
import type { Preset } from '@/types'

const presets: Preset[] = JSON.parse(
  readFileSync(resolve(__dirname, '../../public/presets.json'), 'utf8'),
)

// Precomputed scaled input and model output for preset 0 (Python / onnxruntime)
const SCALED_INPUT_0 = [
  1.129981517791748, -0.5658847093582153, 0.14379684627056122,
  1.1597782373428345, -1.6761853694915771, -0.019387125968933105,
  -0.13099932670593262, 0.482324481010437, 0.055042389780282974,
  0.21426160633563995, -1.2704178094863892, 0.663366973400116,
  0.7972266674041748, 0.4111926555633545, -0.1872173696756363,
  -0.07554075121879578, 0.7419521808624268, -1.4654284715652466,
  0.7615216374397278, -0.14804673194885254, -0.09310177713632584,
  0.30234456062316895, 0.9017314910888672, -0.5273792147636414,
  -0.5218760371208191, 1.120989441871643, 1.5418064594268799,
  -0.2962915599346161, 0.014546213671565056, -0.11196442693471909,
]
const MODEL_OUTPUT_0 = new Float32Array([
  0.22383838891983032, -0.2540619373321533, 0.42121565341949463,
  0.5896289348602295, -0.7735874056816101, 0.15729737281799316,
  -0.38566917181015015, 0.6059585809707642, 0.04253876209259033,
  -0.7510138750076294, -0.4162801504135132, 0.6202290654182434,
  0.9421867728233337, -0.412865549325943, 0.17124435305595398,
  0.03232079744338989, 0.5842752456665039, -1.2364563941955566,
  0.19055229425430298, 0.5337880849838257, -0.10579788684844971,
  0.054936230182647705, -0.05041724443435669, -0.12879562377929688,
  -0.2309201955795288, -0.4258308410644531, 0.15812982618808746,
  -0.06840384006500244, 0.052703917026519775, -0.21830964088439941,
])

describe('reconstructionError', () => {
  it('returns 30 per-feature values', () => {
    const { perFeature } = reconstructionError(SCALED_INPUT_0, MODEL_OUTPUT_0)
    expect(perFeature).toHaveLength(30)
  })

  it('total is mean of perFeature (not sum)', () => {
    const { perFeature, total } = reconstructionError(SCALED_INPUT_0, MODEL_OUTPUT_0)
    const expectedMean = perFeature.reduce((s, v) => s + v, 0) / perFeature.length
    expect(total).toBeCloseTo(expectedMean, 10)
  })

  it('preset 0 total matches ae_error within 1e-4', () => {
    const { total } = reconstructionError(SCALED_INPUT_0, MODEL_OUTPUT_0)
    expect(Math.abs(total - presets[0].ae_error)).toBeLessThan(1e-4)
  })
})
