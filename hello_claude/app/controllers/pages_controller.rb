class PagesController < ApplicationController
  def hello
  end

  def chat
    user_message = params[:message].to_s.strip
    response = { reply: generate_reply(user_message) }
    render json: response
  end

  private

  def generate_reply(message)
    return "Please say something!" if message.empty?

    greetings = %w[hello hi hey greetings howdy]
    if greetings.any? { |g| message.downcase.include?(g) }
      "Hello! I'm Claude. Great to meet you! How can I help you today?"
    elsif message.downcase.include?("how are you")
      "I'm doing wonderfully, thank you for asking! Ready to assist you with anything you need."
    elsif message.downcase.include?("who are you") || message.downcase.include?("what are you")
      "I'm Claude, an AI assistant made by Anthropic. I'm here to help, chat, and answer your questions!"
    elsif message.downcase.include?("bye") || message.downcase.include?("goodbye")
      "Goodbye! It was great chatting with you. Come back anytime!"
    else
      "Thanks for saying: \"#{message}\". I'm Claude, your friendly AI assistant. Feel free to ask me anything!"
    end
  end
end
