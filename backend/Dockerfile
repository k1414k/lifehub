FROM ruby:3.3.0-slim

RUN apt-get update -qq && apt-get install -y \
    build-essential \
    libpq-dev \
    libvips \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY Gemfile ./
# Gemfile.lockがあればコピー（なくてもOK）
COPY Gemfile.lock* ./
RUN bundle install --jobs 4 --retry 3

COPY . .

RUN mkdir -p tmp/pids tmp/cache tmp/sockets storage log

ENTRYPOINT ["./entrypoint.sh"]
EXPOSE 3001
CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0", "-p", "3001"]
