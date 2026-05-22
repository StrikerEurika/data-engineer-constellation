.PHONY: up down lint test clean

up:
	docker compose up -d --build

down:
	docker compose down

down-v:
	docker compose down -v

lint:
	ruff check projects/

test:
	pytest projects/

clean:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name node_modules -exec rm -rf {} + 2>/dev/null || true
