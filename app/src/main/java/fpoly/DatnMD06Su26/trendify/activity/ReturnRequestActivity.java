package fpoly.DatnMD06Su26.trendify.activity;

import fpoly.DatnMD06Su26.trendify.R;

import fpoly.DatnMD06Su26.trendify.activity.*;
import fpoly.DatnMD06Su26.trendify.fragment.*;
import fpoly.DatnMD06Su26.trendify.adapter.*;
import fpoly.DatnMD06Su26.trendify.model.*;
import fpoly.DatnMD06Su26.trendify.helper.*;

import android.os.Bundle;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.Toast;
import android.content.Intent;
import android.view.View;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.MaterialAutoCompleteTextView;
import com.google.android.material.textfield.TextInputEditText;

import android.widget.LinearLayout;
import android.widget.CheckBox;
import android.widget.TextView;
import android.view.LayoutInflater;
import com.bumptech.glide.Glide;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Set;
import java.util.HashSet;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.DocumentSnapshot;

public class ReturnRequestActivity extends AppCompatActivity {

    private ImageView ivBack;
    private MaterialAutoCompleteTextView actOrder;
    private MaterialAutoCompleteTextView actReturnReason;
    private TextInputEditText etDescription;
    private MaterialButton btnSubmitReturn;
    private View layoutUploadImage;
    private ImageView ivProofImage;
    private LinearLayout llProductContainer;
    
    private static final int PICK_IMAGE_REQUEST = 123;
    private String selectedImageUriString = "";
    private String targetOrderId = "";
    
    private Set<String> selectedReturnProductIds = new HashSet<>();
    private List<Map<String, Object>> orderItems = new ArrayList<>();

    private final String[] sampleOrders = {
            "#TRF-2026-001234 - 02/06/2026",
            "#TRF-2026-001128 - 28/05/2026",
            "#TRF-2026-000986 - 20/05/2026"
    };

    private final String[] returnReasons = {
            "Sai kích thước",
            "Sai màu sắc",
            "Sản phẩm lỗi",
            "Không giống mô tả",
            "Giao nhầm sản phẩm",
            "Khác"
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_return_request);

        initViews();
        setupToolbar();
        setupDropdowns();
        setupImageUpload();
        setupSubmitAction();
    }

    private void initViews() {
        ivBack = findViewById(R.id.ivBack);
        actOrder = findViewById(R.id.actOrder);
        actReturnReason = findViewById(R.id.actReturnReason);
        etDescription = findViewById(R.id.etDescription);
        btnSubmitReturn = findViewById(R.id.btnSubmitReturn);
        layoutUploadImage = findViewById(R.id.layoutUploadImage);
        ivProofImage = findViewById(R.id.ivProofImage);
        llProductContainer = findViewById(R.id.llProductContainer);
    }

    private void setupToolbar() {
        ivBack.setOnClickListener(v -> finish());
    }

    private void setupDropdowns() {
        ArrayAdapter<String> orderAdapter = new ArrayAdapter<>(this, android.R.layout.simple_list_item_1, sampleOrders);
        ArrayAdapter<String> reasonAdapter = new ArrayAdapter<>(this, android.R.layout.simple_list_item_1, returnReasons);

        actOrder.setAdapter(orderAdapter);
        actReturnReason.setAdapter(reasonAdapter);
        
        String passedOrderId = getIntent().getStringExtra("orderId");
        if (passedOrderId != null && !passedOrderId.isEmpty()) {
            actOrder.setText(passedOrderId, false);
            actOrder.setEnabled(false);
            targetOrderId = passedOrderId;
            fetchOrderItems(targetOrderId);
        } else {
            actOrder.setText(sampleOrders[0], false);
        }
        actReturnReason.setText(returnReasons[0], false);
    }

    private void fetchOrderItems(String orderId) {
        FirebaseFirestore.getInstance().collection("orders")
                .whereEqualTo("orderId", orderId)
                .get()
                .addOnSuccessListener(queryDocumentSnapshots -> {
                    if (!queryDocumentSnapshots.isEmpty()) {
                        DocumentSnapshot doc = queryDocumentSnapshots.getDocuments().get(0);
                        Object itemsObj = doc.get("items");
                        if (itemsObj instanceof List) {
                            orderItems = (List<Map<String, Object>>) itemsObj;
                            renderOrderItems();
                        }
                    }
                });
    }

    private void renderOrderItems() {
        if (llProductContainer == null) return;
        llProductContainer.removeAllViews();
        LayoutInflater inflater = LayoutInflater.from(this);

        for (Map<String, Object> itemMap : orderItems) {
            String productId = itemMap.containsKey("productId") ? (String) itemMap.get("productId") : null;
            if (productId == null) {
                productId = itemMap.containsKey("cartItemId") ? (String) itemMap.get("cartItemId") : null;
            }
            if (productId == null) continue;
            
            final String finalProductId = productId;

            View itemView = inflater.inflate(R.layout.item_return_product, llProductContainer, false);
            CheckBox cbSelectProduct = itemView.findViewById(R.id.cbSelectProduct);
            ImageView ivProductImage = itemView.findViewById(R.id.ivProductImage);
            TextView tvProductName = itemView.findViewById(R.id.tvProductName);
            TextView tvProductVariant = itemView.findViewById(R.id.tvProductVariant);
            TextView tvProductQuantity = itemView.findViewById(R.id.tvProductQuantity);
            TextView tvProductPrice = itemView.findViewById(R.id.tvProductPrice);

            String name = itemMap.containsKey("name") ? (String) itemMap.get("name") : "";
            String size = itemMap.containsKey("size") ? (String) itemMap.get("size") : "";
            String color = itemMap.containsKey("color") ? (String) itemMap.get("color") : "";
            long quantityVal = 1;
            if (itemMap.get("quantity") != null) {
                Object qtyObj = itemMap.get("quantity");
                if (qtyObj instanceof Number) quantityVal = ((Number) qtyObj).longValue();
                else if (qtyObj instanceof String) {
                    try { quantityVal = Long.parseLong(qtyObj.toString()); } catch (Exception e) {}
                }
            }

            long priceVal = 0;
            if (itemMap.get("price") != null) {
                Object priceObj = itemMap.get("price");
                if (priceObj instanceof Number) priceVal = ((Number) priceObj).longValue();
                else if (priceObj instanceof String) {
                    try { priceVal = Long.parseLong(priceObj.toString()); } catch (Exception e) {}
                }
            }
            
            String imageUrl = itemMap.containsKey("imageUrl") ? (String) itemMap.get("imageUrl") : "";

            tvProductName.setText(name);
            tvProductVariant.setText("Size: " + size + " | Màu: " + color);
            tvProductQuantity.setText("Số lượng: " + quantityVal);
            tvProductPrice.setText(String.format("%,dđ", priceVal).replace(",", "."));

            if (imageUrl != null && !imageUrl.isEmpty()) {
                Glide.with(this).load(imageUrl).into(ivProductImage);
            }

            cbSelectProduct.setOnCheckedChangeListener((buttonView, isChecked) -> {
                if (isChecked) {
                    selectedReturnProductIds.add(finalProductId);
                } else {
                    selectedReturnProductIds.remove(finalProductId);
                }
            });

            llProductContainer.addView(itemView);
        }
    }

    private void setupSubmitAction() {
        btnSubmitReturn.setOnClickListener(v -> {
            String selectedOrderString = actOrder.getText() == null ? "" : actOrder.getText().toString();
            String targetOrderId = selectedOrderString;
            if (targetOrderId.contains(" ")) {
                targetOrderId = targetOrderId.split(" ")[0].replace("#", "");
            } else {
                targetOrderId = targetOrderId.replace("#", "");
            }

            if (targetOrderId.isEmpty()) {
                Toast.makeText(this, "Vui lòng chọn đơn hàng", Toast.LENGTH_SHORT).show();
                return;
            }
            
            if (selectedReturnProductIds.isEmpty()) {
                Toast.makeText(this, "Vui lòng chọn ít nhất một sản phẩm để trả", Toast.LENGTH_SHORT).show();
                return;
            }

            String reason = actReturnReason.getText() == null ? "" : actReturnReason.getText().toString();
            String description = etDescription.getText() == null ? "" : etDescription.getText().toString().trim();

            // Lọc ra các sản phẩm được hoàn trả
            List<Map<String, Object>> returnedItemsList = new ArrayList<>();
            long totalRefundAmount = 0;
            for (Map<String, Object> item : orderItems) {
                String productId = item.containsKey("productId") ? (String) item.get("productId") : null;
                if (productId == null) {
                    productId = item.containsKey("cartItemId") ? (String) item.get("cartItemId") : null;
                }
                if (selectedReturnProductIds.contains(productId)) {
                    returnedItemsList.add(item);
                    long quantityVal = 0;
                    if (item.get("quantity") != null) {
                        Object qtyObj = item.get("quantity");
                        if (qtyObj instanceof Number) quantityVal = ((Number) qtyObj).longValue();
                        else if (qtyObj instanceof String) {
                            try { quantityVal = Long.parseLong(qtyObj.toString()); } catch (Exception e) {}
                        }
                    }
                    
                    long priceVal = 0;
                    if (item.get("price") != null) {
                        Object priceObj = item.get("price");
                        if (priceObj instanceof Number) priceVal = ((Number) priceObj).longValue();
                        else if (priceObj instanceof String) {
                            try { priceVal = Long.parseLong(priceObj.toString()); } catch (Exception e) {}
                        }
                    }
                    
                    totalRefundAmount += (priceVal * quantityVal);
                }
            }

            // Prepare updates map
            Map<String, Object> updates = new HashMap<>();
            updates.put("status", "Trả hàng/Hoàn tiền");
            updates.put("returnReason", reason);
            updates.put("returnDescription", description);
            updates.put("returnedItems", returnedItemsList);
            updates.put("returnRefundAmount", totalRefundAmount);
            
            // Set return images (using selectedImageUriString if present, otherwise mock image)
            java.util.List<String> images = new java.util.ArrayList<>();
            if (!selectedImageUriString.isEmpty()) {
                images.add(selectedImageUriString);
            } else {
                images.add("https://firebasestorage.googleapis.com/v0/b/ketnoifirebase-3a966.appspot.com/o/return_mock.png?alt=media");
            }
            updates.put("returnImages", images);

            final String finalOrderId = targetOrderId;
            com.google.firebase.firestore.FirebaseFirestore.getInstance()
                    .collection("orders")
                    .document(targetOrderId)
                    .update(updates)
                    .addOnSuccessListener(aVoid -> {
                        Toast.makeText(ReturnRequestActivity.this, "Đã gửi yêu cầu đổi trả thành công!", Toast.LENGTH_LONG).show();
                        finish();
                    })
                    .addOnFailureListener(e -> {
                        // If document ID matches orderId field but the doc ID is random:
                        com.google.firebase.firestore.FirebaseFirestore.getInstance()
                                .collection("orders")
                                .whereEqualTo("orderId", finalOrderId)
                                .get()
                                .addOnSuccessListener(queryDocumentSnapshots -> {
                                    if (!queryDocumentSnapshots.isEmpty()) {
                                        queryDocumentSnapshots.getDocuments().get(0).getReference()
                                                .update(updates)
                                                .addOnSuccessListener(aVoid2 -> {
                                                    Toast.makeText(ReturnRequestActivity.this, "Đã gửi yêu cầu đổi trả thành công!", Toast.LENGTH_LONG).show();
                                                    finish();
                                                })
                                                .addOnFailureListener(err -> {
                                                    Toast.makeText(ReturnRequestActivity.this, "Lỗi gửi yêu cầu: " + err.getMessage(), Toast.LENGTH_SHORT).show();
                                                });
                                    } else {
                                        Toast.makeText(ReturnRequestActivity.this, "Không tìm thấy đơn hàng trong hệ thống: " + finalOrderId, Toast.LENGTH_SHORT).show();
                                    }
                                });
                    });
        });
    }

    private void setupImageUpload() {
        if (layoutUploadImage != null) {
            layoutUploadImage.setOnClickListener(v -> {
                Intent galleryIntent = new Intent(Intent.ACTION_PICK, android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
                startActivityForResult(galleryIntent, PICK_IMAGE_REQUEST);
            });
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == PICK_IMAGE_REQUEST && resultCode == RESULT_OK && data != null && data.getData() != null) {
            android.net.Uri imageUri = data.getData();
            if (ivProofImage != null) {
                ivProofImage.setImageURI(imageUri);
                ivProofImage.setVisibility(View.VISIBLE);
            }
            selectedImageUriString = imageUri.toString();
        }
    }
}
