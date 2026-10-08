import { getApiError } from "@/shared/api"
import { isHttpClientError } from "@/shared/api"

export function getCheckoutErrorMessage(error: unknown) {
  const apiError = getApiError(error)

  switch (apiError?.code) {
    case "WALLET_CONNECTION_REFUSED":
      return "A conexão foi recusada na carteira. Tente novamente quando estiver pronto."
    case "WALLET_CONNECTION_REQUIRED":
      return "Conecte a carteira selecionada antes de revisar a compra."
    case "WALLET_NOT_FOUND":
      return "A carteira selecionada não está mais disponível."
    case "WALLET_NETWORK_UNSUPPORTED":
      return "A carteira selecionada não é compatível com esta rede."
    case "EMPTY_CART":
      return "Seu carrinho está vazio."
    case "INVALID_CHECKOUT_REQUEST":
      return "Revise os dados do checkout e tente novamente."
    case "IDEMPOTENCY_KEY_REUSED":
      return "Os dados da tentativa anterior mudaram. Revise a compra novamente."
    default:
      if (isHttpClientError(error) && !error.response) {
        return "A resposta demorou mais que o esperado. Tente novamente para recuperar o mesmo pedido."
      }

      return "Não foi possível concluir esta etapa. Tente novamente."
  }
}
