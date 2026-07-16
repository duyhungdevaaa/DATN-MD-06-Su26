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

public class ReturnRequestActivity extends AppCompatActivity {

    private ImageView ivBack;
    private MaterialAutoCompleteTextView actOrder;
    private MaterialAutoCompleteTextView actReturnReason;
    private TextInputEditText etDescription;
    private MaterialButton btnSubmitReturn;
    private View layoutUploadImage;
    private ImageView ivProofImage;
    
    private static final int PICK_IMAGE_REQUEST = 123;
    private String selectedImageUriString = "";

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
        } else {
            actOrder.setText(sampleOrders[0], false);
        }
        actReturnReason.setText(returnReasons[0], false);
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

            String reason = actReturnReason.getText() == null ? "" : actReturnReason.getText().toString();
            String description = etDescription.getText() == null ? "" : etDescription.getText().toString().trim();

            // Prepare updates map
            java.util.Map<String, Object> updates = new java.util.HashMap<>();
            updates.put("status", "Trả hàng/Hoàn tiền");
            updates.put("returnReason", reason);
            updates.put("returnDescription", description);
            
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
