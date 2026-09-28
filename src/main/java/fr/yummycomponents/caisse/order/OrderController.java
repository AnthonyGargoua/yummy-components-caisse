package fr.yummycomponents.caisse.order;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /** POST /api/orders : paie la note. 201 si OK, 400 si note invalide, 409 si stock insuffisant. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Order pay(@RequestBody OrderRequest request) {
        return orderService.pay(request);
    }

    /** GET /api/orders/daily-totals : total encaissé pour chaque jour. */
    @GetMapping("/daily-totals")
    public List<DailyTotal> dailyTotals() {
        return orderService.dailyTotals();
    }
}
