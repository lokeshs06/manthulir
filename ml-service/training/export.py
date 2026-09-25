"""
Exports a trained checkpoint to TorchScript (and optionally ONNX) for use by
the FastAPI inference service, tagged with a model_version string.

Usage:
    python export.py --checkpoint ../artifacts/best_model.pt --num-classes 12 \
        --model-version v1.0.0-2026-01-15 --onnx
"""

import argparse
from pathlib import Path

import torch

from train import build_model


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--checkpoint", default="../artifacts/best_model.pt")
    parser.add_argument("--num-classes", type=int, required=True)
    parser.add_argument("--out-dir", default="../artifacts")
    parser.add_argument("--model-version", required=True)
    parser.add_argument("--onnx", action="store_true", help="Also export an ONNX artifact")
    args = parser.parse_args()

    device = torch.device("cpu")
    model = build_model(args.num_classes)
    model.load_state_dict(torch.load(args.checkpoint, map_location=device))
    model.eval()

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    example_input = torch.randn(1, 3, 224, 224)

    traced = torch.jit.trace(model, example_input)
    torchscript_path = out_dir / "model.torchscript.pt"
    traced.save(str(torchscript_path))
    print(f"TorchScript model saved to {torchscript_path}")

    if args.onnx:
        onnx_path = out_dir / "model.onnx"
        torch.onnx.export(
            model,
            example_input,
            str(onnx_path),
            input_names=["input"],
            output_names=["output"],
            dynamic_axes={"input": {0: "batch_size"}, "output": {0: "batch_size"}},
            opset_version=17,
        )
        print(f"ONNX model saved to {onnx_path}")

    version_path = out_dir / "model_version.txt"
    version_path.write_text(args.model_version, encoding="utf-8")
    print(f"Model version '{args.model_version}' recorded in {version_path}")
    print("\nUpdate ml-service/.env: MODEL_VERSION and MOCK_MODEL=false to serve this model.")


if __name__ == "__main__":
    main()
