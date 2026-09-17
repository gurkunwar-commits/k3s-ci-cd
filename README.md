# k3s-ci-cd

CI/CD demos for a Tailscale-secured Portainer + k3s platform.

## Design rule

| Piece | Responsibility |
| --- | --- |
| GitHub Actions | Test, build, push image to GHCR, update Git manifests |
| Portainer GitOps | Poll Git and reconcile the cluster |
| Tailscale | Admin access to Portainer only (no public Portainer / webhooks) |

Because Portainer is **not** on the public internet, GitHub-hosted runners cannot call Portainer webhooks. Polling Git from inside the cluster is the correct CD path.

## Demos

| Folder | What it shows |
| --- | --- |
| [`demo-api/`](./demo-api) | Sample API backend + Dockerfile + k8s YAML + GitHub Actions → GHCR → Git tag bump → Portainer poll |

## Quick start (demo-api)

1. Push to `main` (or merge a PR that touches `demo-api/`).
2. Confirm the Actions workflow publishes `ghcr.io/<owner>/demo-api:<sha>` and updates `demo-api/k8s/deployment.yaml`.
3. In Portainer (over Tailscale), deploy that manifest path from Git with **GitOps updates → Polling**.
4. Confirm rollout: `kubectl -n demo get pods -l app=demo-api -o wide`.

See [`demo-api/README.md`](./demo-api/README.md) for Portainer click-path details.
