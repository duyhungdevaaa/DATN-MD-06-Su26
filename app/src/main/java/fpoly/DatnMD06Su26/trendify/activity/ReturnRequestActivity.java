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
    private long orderSubtotal = 0;
    private long orderDiscountAmount = 0;
    private long orderShippingFee = 0;
    private long orderTotal = 0;

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
                        
                        // Lưu thông tin thanh toán của đơn hàng
                        Long subtotalVal = doc.getLong("subtotal");
                        Long shippingVal = doc.getLong("shippingFee");
                        Long discountVal = doc.getLong("discountAmount");
                        if (discountVal == null) discountVal = doc.getLong("discount");
                        Long totalVal = doc.getLong("total");

                        orderShippingFee = (shippingVal != null) ? shippingVal : 0;
                        orderDiscountAmount = (discountVal != null) ? discountVal : 0;
                        orderTotal = (totalVal != null) ? totalVal : 0;

                        // Kiểm tra nếu đơn hàng này đã từng yêu cầu trả hàng hoàn tiền
                        Boolean isReturnRequested = doc.getBoolean("isReturnRequested");
                        Object returnedItemsObj = doc.get("returnedItems");
                        String status = doc.getString("status");
                        boolean alreadyRequested = Boolean.TRUE.equals(isReturnRequested)
                                || (returnedItemsObj instanceof List && !((List<?>) returnedItemsObj).isEmpty())
                                || (status != null && (status.contains("Trả hàng") || status.contains("hoàn") || status.contains("Từ chối")));

                        if (alreadyRequested) {
                            Toast.makeText(this, "Đơn hàng này đã gửi yêu cầu trả hàng/hoàn tiền. Mỗi đơn hàng chỉ được hoàn 1 lần duy nhất.", Toast.LENGTH_LONG).show();
                            if (btnSubmitReturn != null) {
                                btnSubmitReturn.setEnabled(false);
                                btnSubmitReturn.setText("ĐÃ GỬI YÊU CẦU HOÀN TRẢ");
                            }
                        }

                        Object itemsObj = doc.get("items");
                        if (itemsObj instanceof List) {
                            orderItems = (List<Map<String, Object>>) itemsObj;
                            long calcSubtotal = 0;
                            for (Map<String, Object> itemMap : orderItems) {
                                long p = 0, q = 1;
                                if (itemMap.get("price") instanceof Number) p = ((Number) itemMap.get("price")).longValue();
                                if (itemMap.get("quantity") instanceof Number) q = ((Number) itemMap.get("quantity")).longValue();
                                calcSubtotal += (p * q);
                            }
                            orderSubtotal = (subtotalVal != null && subtotalVal > 0) ? subtotalVal : calcSubtotal;
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
            long returnedItemsRawAmount = 0;
            for (Map<String, Object> item : orderItems) {
                String productId = item.containsKey("productId") ? (String) item.get("productId") : null;
                if (productId == null) {
                    productId = item.containsKey("cartItemId") ? (String) item.get("cartItemId") : null;
                }
                if (selectedReturnProductIds.contains(productId)) {
                    returnedItemsList.add(item);
                    long quantityVal = 1;
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
                    
                    returnedItemsRawAmount += (priceVal * quantityVal);
                }
            }

            // TÍNH TIỀN HOÀN CHÍNH XÁC:
            // Tiền hoàn = Giá trị các sản phẩm được trả - (Giảm giá voucher tương ứng)
            // TUYỆT ĐỐI KHÔNG HOÀN TIỀN SHIP (vì phí vận chuyển đã dùng cho dịch vụ giao nhận)
            long calculatedDiscount = 0;
            if (orderSubtotal > 0 && orderDiscountAmount > 0) {
                double ratio = (double) returnedItemsRawAmount / (double) orderSubtotal;
                if (ratio > 1.0) ratio = 1.0;
                calculatedDiscount = Math.round(orderDiscountAmount * ratio);
            }
            
            long totalRefundAmount = returnedItemsRawAmount - calculatedDiscount;
            if (totalRefundAmount < 0) totalRefundAmount = 0;

            // Giới hạn tối đa không vượt quá (Tổng tiền khách trả - Phí ship)
            long maxRefundAllowed = Math.max(0, orderTotal - orderShippingFee);
            if (orderTotal > 0 && totalRefundAmount > maxRefundAllowed) {
                totalRefundAmount = maxRefundAllowed;
            }

            // Prepare updates map
            Map<String, Object> updates = new HashMap<>();
            updates.put("status", "Trả hàng/Hoàn tiền");
            updates.put("isReturnRequested", true);
            updates.put("returnStatus", "PENDING");
            updates.put("returnReason", reason);
            updates.put("returnDescription", description);
            updates.put("returnedItems", returnedItemsList);
            updates.put("returnRefundAmount", totalRefundAmount);
            final String finalOrderId = targetOrderId;
            final long finalTotalRefundAmount = totalRefundAmount;
            final long finalReturnedItemsRawAmount = returnedItemsRawAmount;
            final long finalCalculatedDiscount = calculatedDiscount;
            final int selectedCount = returnedItemsList.size();

            new android.app.AlertDialog.Builder(ReturnRequestActivity.this)
                    .setTitle("Xác nhận gửi yêu cầu hoàn trả")
                    .setMessage("Bạn có chắc chắn muốn gửi yêu cầu đổi trả cho " + selectedCount + " sản phẩm đã chọn?\n\n"
                            + "• Giá trị sản phẩm hoàn trả: " + String.format("%,dđ", finalReturnedItemsRawAmount).replace(",", ".") + "\n"
                            + (finalCalculatedDiscount > 0 ? "• Giảm giá voucher khấu trừ: -" + String.format("%,dđ", finalCalculatedDiscount).replace(",", ".") + "\n" : "")
                            + "• Phí vận chuyển: Không hoàn trả\n"
                            + "👉 Tổng tiền hoàn vào Ví: " + String.format("%,dđ", finalTotalRefundAmount).replace(",", ".") + "\n\n"
                            + "⚠️ Lưu ý:\n"
                            + "• Mỗi đơn hàng chỉ được yêu cầu đổi trả 01 LẦN DUY NHẤT.\n"
                            + "• Tiền hoàn chỉ tính trên sản phẩm sau voucher và không hoàn phí vận chuyển.")
                    .setPositiveButton("Xác nhận gửi", (dialog, which) -> {
                        android.app.ProgressDialog progressDialog = new android.app.ProgressDialog(ReturnRequestActivity.this);
                        progressDialog.setMessage("Đang gửi yêu cầu đổi trả...");
                        progressDialog.setCancelable(false);
                        progressDialog.show();

                        if (selectedImageBytes != null && selectedImageBytes.length > 0) {
                            final String base64Image = "data:image/jpeg;base64," + android.util.Base64.encodeToString(selectedImageBytes, android.util.Base64.NO_WRAP);
                            String fileName = "return_" + finalOrderId + "_" + System.currentTimeMillis() + ".jpg";
                            com.google.firebase.storage.StorageReference storageRef = com.google.firebase.storage.FirebaseStorage.getInstance()
                                    .getReference("return_proofs/" + fileName);

                            storageRef.putBytes(selectedImageBytes)
                                    .addOnSuccessListener(taskSnapshot -> {
                                        storageRef.getDownloadUrl().addOnSuccessListener(downloadUri -> {
                                            java.util.List<String> images = new java.util.ArrayList<>();
                                            images.add(downloadUri.toString());
                                            updates.put("returnImages", images);
                                            executeOrderUpdate(finalOrderId, updates, progressDialog);
                                        }).addOnFailureListener(e -> {
                                            // Fallback to Base64 so image is never lost
                                            java.util.List<String> images = new java.util.ArrayList<>();
                                            images.add(base64Image);
                                            updates.put("returnImages", images);
                                            executeOrderUpdate(finalOrderId, updates, progressDialog);
                                        });
                                    })
                                    .addOnFailureListener(e -> {
                                        // Fallback to Base64 so image is never lost
                                        java.util.List<String> images = new java.util.ArrayList<>();
                                        images.add(base64Image);
                                        updates.put("returnImages", images);
                                        executeOrderUpdate(finalOrderId, updates, progressDialog);
                                    });
                        } else {
                            updates.put("returnImages", new java.util.ArrayList<>());
                            executeOrderUpdate(finalOrderId, updates, progressDialog);
                        }
                    })
                    .setNegativeButton("Kiểm tra lại", null)
                    .show();
        });
    }

    private void executeOrderUpdate(String finalOrderId, Map<String, Object> updates, android.app.ProgressDialog progressDialog) {
        com.google.firebase.firestore.FirebaseFirestore db = com.google.firebase.firestore.FirebaseFirestore.getInstance();
        
        // Find document by orderId field first
        db.collection("orders")
                .whereEqualTo("orderId", finalOrderId)
                .get()
                .addOnSuccessListener(queryDocumentSnapshots -> {
                    if (!queryDocumentSnapshots.isEmpty()) {
                        queryDocumentSnapshots.getDocuments().get(0).getReference()
                                .update(updates)
                                .addOnSuccessListener(aVoid -> {
                                    if (progressDialog != null && progressDialog.isShowing()) progressDialog.dismiss();
                                    Toast.makeText(ReturnRequestActivity.this, "Đã gửi yêu cầu đổi trả thành công!", Toast.LENGTH_LONG).show();
                                    finish();
                                })
                                .addOnFailureListener(err -> {
                                    if (progressDialog != null && progressDialog.isShowing()) progressDialog.dismiss();
                                    Toast.makeText(ReturnRequestActivity.this, "Lỗi cập nhật đơn: " + err.getMessage(), Toast.LENGTH_SHORT).show();
                                });
                    } else {
                        // Try updating by document ID
                        db.collection("orders").document(finalOrderId)
                                .update(updates)
                                .addOnSuccessListener(aVoid -> {
                                    if (progressDialog != null && progressDialog.isShowing()) progressDialog.dismiss();
                                    Toast.makeText(ReturnRequestActivity.this, "Đã gửi yêu cầu đổi trả thành công!", Toast.LENGTH_LONG).show();
                                    finish();
                                })
                                .addOnFailureListener(err -> {
                                    if (progressDialog != null && progressDialog.isShowing()) progressDialog.dismiss();
                                    Toast.makeText(ReturnRequestActivity.this, "Không tìm thấy đơn hàng: " + finalOrderId, Toast.LENGTH_SHORT).show();
                                });
                    }
                })
                .addOnFailureListener(e -> {
                    if (progressDialog != null && progressDialog.isShowing()) progressDialog.dismiss();
                    Toast.makeText(ReturnRequestActivity.this, "Lỗi kết nối máy chủ: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                });
    }

    private android.net.Uri selectedImageUri = null;
    private byte[] selectedImageBytes = null;

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
            selectedImageUri = data.getData();
            try {
                java.io.InputStream is = getContentResolver().openInputStream(selectedImageUri);
                android.graphics.Bitmap bitmap = android.graphics.BitmapFactory.decodeStream(is);
                if (bitmap != null) {
                    int maxDim = 800;
                    int w = bitmap.getWidth();
                    int h = bitmap.getHeight();
                    if (w > maxDim || h > maxDim) {
                        float r = Math.min((float) maxDim / w, (float) maxDim / h);
                        w = Math.round(w * r);
                        h = Math.round(h * r);
                        bitmap = android.graphics.Bitmap.createScaledBitmap(bitmap, w, h, true);
                    }
                    java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
                    bitmap.compress(android.graphics.Bitmap.CompressFormat.JPEG, 75, baos);
                    selectedImageBytes = baos.toByteArray();
                }
            } catch (Exception e) {
                e.printStackTrace();
            }

            if (ivProofImage != null) {
                ivProofImage.setImageURI(selectedImageUri);
                ivProofImage.setVisibility(View.VISIBLE);
            }
        }
    }
}
