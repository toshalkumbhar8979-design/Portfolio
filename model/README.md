# Portfolio Q&A model

This folder contains a from-scratch, portfolio-only retrieval model. It learns
TF-IDF passage weights from published project descriptions and answers by
returning the closest matching passages with links to their project pages.

It does not use pretrained weights, an external AI service, or generated
answers. The small index is created in the server runtime from published
Contentlayer documents and is not exposed as a public model download. It stays
well below 100 MB because it consists only of the portfolio text and sparse
term weights.

The model is intentionally a retriever, not a language model: portfolio text
alone is not enough to train a reliable generative LLM from scratch. Queries
without enough matching portfolio terms receive an explicit no-match response.

The Next.js API route at `/api/portfolio-chat` runs inference server-side in
the existing Cloudflare Worker deployment. The browser sends only a question
and receives matching excerpts; it does not receive the model index.
