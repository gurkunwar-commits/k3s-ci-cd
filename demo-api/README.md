# demo-api

Sample Node.js API backend that demonstrates **CI + Portainer GitOps** for the k3s platform.

## Flow

```text
push to main (demo-api/**)
        │
        ▼
GitHub Actions
  • npm test
  • docker build
  • push ghcr.io/<owner>/demo-api:<sha>
  • commit updated image tag in k8s/deployment.yaml
        │
        ▼
Portainer GitOps (Polling)
  • cluster reaches GitHub (outbound)
  • applies demo-api/k8s/
        │
        ▼
Pods roll to the new image
```

Portainer is only reachable on Tailscale, so **do not** rely on Portainer webhooks from GitHub Actions. Use **GitOps updates → Polling** instead. The cluster pulls Git; GitHub never needs inbound access to Portainer.

## Local run

```bash
cd demo-api
npm install
npm test
npm start
# curl localhost:8080/api/v1/info
```

```bash
docker build -t demo-api .
docker run --rm -p 8080:8080 demo-api
```

## First deploy in Portainer

1. Open Portainer over Tailscale.
2. **Applications → Create from manifest → Git repository**.
3. Repository: `https://github.com/gurkunwar-commits/k3s-ci-cd`
4. Reference: `main`
5. Manifest path: `demo-api/k8s/deployment.yaml` (add Ingress later if needed).
6. Enable **GitOps updates**:
   - Mechanism: **Polling**
   - Interval: `1m`–`5m`
   - Prefer “always apply / ensure compliance” if you want Git to overwrite cluster drift.
7. Deploy into namespace `demo` (created by k3s-platform namespaces).

## GHCR pull access

The workflow tries to mark the package **public**. If it stays private, either:

- GitHub → Packages → `demo-api` → Package settings → Change visibility → Public, or
- Create a `ghcr-pull` imagePullSecret in `demo` and reference it on the Deployment.

## Verify

```bash
kubectl -n demo get deploy,po,svc demo-api
kubectl -n demo port-forward svc/demo-api 8080:80
curl -s localhost:8080/api/v1/info | jq
```

After another commit under `demo-api/` on `main`, wait for Actions + the Portainer poll interval, then confirm the pod image tag advanced.
