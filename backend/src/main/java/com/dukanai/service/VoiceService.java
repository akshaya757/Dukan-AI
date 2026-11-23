package com.dukanai.service;

import com.dukanai.dto.response.ProductResponse;
import com.dukanai.dto.response.StockUpdateResponse;
import com.dukanai.dto.response.VoiceResponse;
import com.dukanai.entity.Product;
import com.dukanai.repository.ProductRepository;
import com.dukanai.voice.NlpProcessor;
import com.dukanai.voice.ParsedCommand;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class VoiceService {

    private static final Logger log = LoggerFactory.getLogger(VoiceService.class);

    private final NlpProcessor nlpProcessor;
    private final InventoryService inventoryService;
    private final ProductService productService;
    private final ProductRepository productRepository;

    @Autowired
    public VoiceService(NlpProcessor nlpProcessor, InventoryService inventoryService,
                        ProductService productService, ProductRepository productRepository) {
        this.nlpProcessor = nlpProcessor;
        this.inventoryService = inventoryService;
        this.productService = productService;
        this.productRepository = productRepository;
    }

    /**
     * Process a voice command text string.
     * Returns structured intent + optionally executes if confirmed=true.
     */
    public VoiceResponse processCommand(String text, boolean execute) {
        if (text == null || text.isBlank()) {
            VoiceResponse resp = new VoiceResponse();
            resp.setIntent("UNKNOWN");
            resp.setResponseText("Voice input was not detected. Please try again.");
            resp.setErrorCode("VOICE_FAILURE");
            return resp;
        }

        ParsedCommand cmd = nlpProcessor.parse(text);
        VoiceResponse response = new VoiceResponse();
        response.setOriginalText(text);
        response.setIntent(cmd.getIntent().name());
        response.setProduct(cmd.getProduct());
        response.setQuantity(cmd.getQuantity());
        response.setUnit(cmd.getUnit());

        if (!cmd.isValid()) {
            return handleInvalidCommand(cmd, response);
        }

        if (!execute) {
            // Just parse and return for confirmation step
            response.setResponseText(buildConfirmationText(cmd));
            return response;
        }

        // Execute the command
        return executeCommand(cmd, response);
    }

    private VoiceResponse executeCommand(ParsedCommand cmd, VoiceResponse response) {
        try {
            switch (cmd.getIntent()) {
                case ADD_STOCK -> {
                    Long productId = resolveProductId(cmd.getProduct());
                    StockUpdateResponse update = inventoryService.addStock(
                        productId, cmd.getQuantity(), "VOICE", "Voice command: " + cmd.getOriginalText()
                    );
                    response.setStockUpdate(update);
                    response.setExecuted(true);
                    response.setResponseText(update.getMessage());
                }
                case REMOVE_STOCK -> {
                    Long productId = resolveProductId(cmd.getProduct());
                    StockUpdateResponse update = inventoryService.removeStock(
                        productId, cmd.getQuantity(), "VOICE", "Voice command: " + cmd.getOriginalText()
                    );
                    response.setStockUpdate(update);
                    response.setExecuted(true);
                    response.setResponseText(update.getMessage());
                }
                case CHECK_STOCK -> {
                    Long productId = resolveProductId(cmd.getProduct());
                    ProductResponse product = productService.getProductById(productId);
                    response.setExecuted(true);
                    response.setResponseText(String.format(
                        "%s stock is %.2f %s.",
                        product.getName(), product.getCurrentStock(), product.getUnit()
                    ));
                }
                case LOW_STOCK -> {
                    List<ProductResponse> lowItems = productService.getLowStockProducts();
                    response.setExecuted(true);
                    if (lowItems.isEmpty()) {
                        response.setResponseText("All products have sufficient stock. Great job!");
                    } else {
                        String items = lowItems.stream()
                            .map(p -> p.getName() + " (" + p.getCurrentStock() + " " + p.getUnit() + ")")
                            .collect(Collectors.joining(", "));
                        response.setResponseText("Low stock products: " + items);
                    }
                }
                default -> {
                    response.setResponseText("I didn't understand the command. Please try again.");
                    response.setErrorCode("UNCLEAR_COMMAND");
                }
            }
        } catch (Exception ex) {
            log.error("Error executing voice command", ex);
            response.setExecuted(false);
            response.setResponseText(ex.getMessage());
            response.setErrorCode("DATABASE_FAILURE");
        }

        return response;
    }

    private Long resolveProductId(String productName) {
        if (productName == null || productName.isBlank()) {
            throw new com.dukanai.exception.InvalidCommandException(
                "I couldn't identify the product name. Please say the product name clearly."
            );
        }
        Optional<Product> product = productRepository.findByUserIdAndNameIgnoreCase(1L, productName);
        if (product.isEmpty()) {
            // Try partial match
            List<Product> partials = productRepository
                .findByUserIdAndNameContainingIgnoreCase(1L, productName);
            if (!partials.isEmpty()) {
                return partials.get(0).getId();
            }
            throw new com.dukanai.exception.ProductNotFoundException(
                "'" + productName + "' not found. Please add it first or check the name."
            );
        }
        return product.get().getId();
    }

    private VoiceResponse handleInvalidCommand(ParsedCommand cmd, VoiceResponse response) {
        String errorText;
        String errorCode;

        if (cmd.getIntent() == ParsedCommand.Intent.UNKNOWN) {
            errorText = "I didn't understand the command. Please try again.";
            errorCode = "UNCLEAR_COMMAND";
        } else if (cmd.getProduct() == null || cmd.getProduct().isBlank()) {
            errorText = "I couldn't identify the product. Please say the product name clearly.";
            errorCode = "UNKNOWN_PRODUCT";
        } else if (cmd.getQuantity() == null) {
            errorText = "I couldn't determine the quantity. Please say the quantity again.";
            errorCode = "MISSING_QUANTITY";
        } else {
            errorText = cmd.getErrorMessage() != null ? cmd.getErrorMessage() : "Something went wrong.";
            errorCode = "UNCLEAR_COMMAND";
        }

        response.setResponseText(errorText);
        response.setErrorCode(errorCode);
        return response;
    }

    private String buildConfirmationText(ParsedCommand cmd) {
        return switch (cmd.getIntent()) {
            case ADD_STOCK -> String.format("Add %s %s of %s to stock?",
                cmd.getQuantity(), cmd.getUnit(), cmd.getProduct());
            case REMOVE_STOCK -> String.format("Remove %s %s of %s from stock?",
                cmd.getQuantity(), cmd.getUnit(), cmd.getProduct());
            case CHECK_STOCK -> String.format("Check stock for %s?", cmd.getProduct());
            case LOW_STOCK -> "Show all low stock products?";
            default -> "Unknown command";
        };
    }
}
