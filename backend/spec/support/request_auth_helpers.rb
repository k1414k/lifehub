module RequestAuthHelpers
  def json_headers(extra_headers = {})
    {
      "Content-Type" => "application/json",
      "Accept" => "application/json",
      "Host" => "localhost",
    }.merge(extra_headers)
  end

  def sign_in_headers(user, password: "password")
    post "/api/v1/auth/sign_in",
      params: { user: { email: user.email, password: password } }.to_json,
      headers: json_headers

    json_headers("Authorization" => response.headers["Authorization"])
  end
end

RSpec.configure do |config|
  config.include RequestAuthHelpers, type: :request
end
