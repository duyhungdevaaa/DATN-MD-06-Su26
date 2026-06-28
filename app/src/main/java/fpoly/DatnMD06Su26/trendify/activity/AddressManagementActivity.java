package fpoly.DatnMD06Su26.trendify.activity;

import fpoly.DatnMD06Su26.trendify.R;

import fpoly.DatnMD06Su26.trendify.activity.*;
import fpoly.DatnMD06Su26.trendify.fragment.*;
import fpoly.DatnMD06Su26.trendify.adapter.*;
import fpoly.DatnMD06Su26.trendify.model.*;
import fpoly.DatnMD06Su26.trendify.helper.*;

import android.app.AlertDialog;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.button.MaterialButton;
import com.google.android.material.card.MaterialCardView;
import com.google.android.material.textfield.TextInputEditText;

import java.util.List;

public class AddressManagementActivity extends AppCompatActivity {

    private ImageView ivBack;
    private MaterialButton btnAddAddress;
    private MaterialButton btnEditHome;
    private MaterialButton btnDeleteHome;
    private MaterialButton btnEditOffice;
    private MaterialButton btnDeleteOffice;
    private MaterialButton btnSetOfficeDefault;
    private MaterialButton btnEditFamily;
    private MaterialButton btnDeleteFamily;
    private MaterialButton btnSetFamilyDefault;
    private MaterialCardView cardHomeAddress;
    private MaterialCardView cardOfficeAddress;
    private MaterialCardView cardFamilyAddress;
    private TextView tvHomeName;
    private TextView tvHomePhone;
    private TextView tvHomeDetail;
    private TextView tvOfficeName;
    private TextView tvOfficePhone;
    private TextView tvOfficeDetail;
    private TextView tvFamilyName;
    private TextView tvFamilyPhone;
    private TextView tvFamilyDetail;
    private UserAddress homeAddress;
    private UserAddress officeAddress;
    private UserAddress familyAddress;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_address_management);

        initViews();
        setupToolbar();
        setupAddressActions();
        setupPrimaryAction();
        loadAddresses();
    }

    private void initViews() {
        ivBack = findViewById(R.id.ivBack);
        btnAddAddress = findViewById(R.id.btnAddAddress);
        btnEditHome = findViewById(R.id.btnEditHome);
        btnDeleteHome = findViewById(R.id.btnDeleteHome);
        btnEditOffice = findViewById(R.id.btnEditOffice);
        btnDeleteOffice = findViewById(R.id.btnDeleteOffice);
        btnSetOfficeDefault = findViewById(R.id.btnSetOfficeDefault);
        btnEditFamily = findViewById(R.id.btnEditFamily);
        btnDeleteFamily = findViewById(R.id.btnDeleteFamily);
        btnSetFamilyDefault = findViewById(R.id.btnSetFamilyDefault);
        cardHomeAddress = findViewById(R.id.cardHomeAddress);
        cardOfficeAddress = findViewById(R.id.cardOfficeAddress);
        cardFamilyAddress = findViewById(R.id.cardFamilyAddress);
        tvHomeName = findViewById(R.id.tvHomeName);
        tvHomePhone = findViewById(R.id.tvHomePhone);
        tvHomeDetail = findViewById(R.id.tvHomeDetail);
        tvOfficeName = findViewById(R.id.tvOfficeName);
        tvOfficePhone = findViewById(R.id.tvOfficePhone);
        tvOfficeDetail = findViewById(R.id.tvOfficeDetail);
        tvFamilyName = findViewById(R.id.tvFamilyName);
        tvFamilyPhone = findViewById(R.id.tvFamilyPhone);
        tvFamilyDetail = findViewById(R.id.tvFamilyDetail);
    }

    private void setupToolbar() {
        ivBack.setOnClickListener(v -> finish());
    }

    private void setupAddressActions() {
        cardHomeAddress.setOnClickListener(v -> showMessage("Địa chỉ mặc định của bạn"));
        cardOfficeAddress.setOnClickListener(v -> showMessage("Địa chỉ văn phòng"));
        cardFamilyAddress.setOnClickListener(v -> showMessage("Địa chỉ gia đình"));

        btnEditHome.setOnClickListener(v -> showAddressForm("home", homeAddress));
        btnDeleteHome.setOnClickListener(v -> showMessage("Không thể xóa địa chỉ mặc định"));

        btnEditOffice.setOnClickListener(v -> showAddressForm("office", officeAddress));
        btnDeleteOffice.setOnClickListener(v -> deleteAddress("office"));
        btnSetOfficeDefault.setOnClickListener(v -> setDefaultAddress("office"));

        btnEditFamily.setOnClickListener(v -> showAddressForm("family", familyAddress));
        btnDeleteFamily.setOnClickListener(v -> deleteAddress("family"));
        btnSetFamilyDefault.setOnClickListener(v -> setDefaultAddress("family"));
    }

    private void setupPrimaryAction() {
        btnAddAddress.setOnClickListener(v -> showAddressTypeSelector());
    }

    private void loadAddresses() {
        FirestoreHelper.loadAddresses(new FirestoreHelper.AddressesCallback() {
            @Override
            public void onLoaded(List<UserAddress> addresses) {
                homeAddress = null;
                officeAddress = null;
                familyAddress = null;
                for (UserAddress address : addresses) {
                    if (address.getType() == null) continue;
                    switch (address.getType()) {
                        case "home":
                            homeAddress = address;
                            break;
                        case "office":
                            officeAddress = address;
                            break;
                        case "family":
                            familyAddress = address;
                            break;
                    }
                }
                refreshAddressViews();
            }

            @Override
            public void onFailure(String error) {
                showMessage("Không thể tải địa chỉ: " + error);
            }
        });
    }

    private void refreshAddressViews() {
        if (homeAddress != null) {
            tvHomeName.setText(homeAddress.getName());
            tvHomePhone.setText(homeAddress.getPhone());
            tvHomeDetail.setText(homeAddress.getAddress());
        } else {
            tvHomeName.setText("Chưa có địa chỉ");
            tvHomePhone.setText("Chưa có số điện thoại");
            tvHomeDetail.setText("Chưa có địa chỉ nhà riêng");
        }

        if (officeAddress != null) {
            tvOfficeName.setText(officeAddress.getName());
            tvOfficePhone.setText(officeAddress.getPhone());
            tvOfficeDetail.setText(officeAddress.getAddress());
        } else {
            tvOfficeName.setText("Chưa có địa chỉ");
            tvOfficePhone.setText("Chưa có số điện thoại");
            tvOfficeDetail.setText("Chưa có địa chỉ văn phòng");
        }

        if (familyAddress != null) {
            tvFamilyName.setText(familyAddress.getName());
            tvFamilyPhone.setText(familyAddress.getPhone());
            tvFamilyDetail.setText(familyAddress.getAddress());
        } else {
            tvFamilyName.setText("Chưa có địa chỉ");
            tvFamilyPhone.setText("Chưa có số điện thoại");
            tvFamilyDetail.setText("Chưa có địa chỉ gia đình");
        }
    }

    private void showAddressTypeSelector() {
        String[] types = {"Nhà riêng", "Văn phòng", "Gia đình"};
        new AlertDialog.Builder(this)
                .setTitle("Chọn loại địa chỉ")
                .setItems(types, (dialog, which) -> {
                    if (which == 0) {
                        showAddressForm("home", homeAddress);
                    } else if (which == 1) {
                        showAddressForm("office", officeAddress);
                    } else {
                        showAddressForm("family", familyAddress);
                    }
                })
                .show();
    }

    private void showAddressForm(String type, UserAddress existingAddress) {
        View dialogView = LayoutInflater.from(this).inflate(R.layout.dialog_address_form, null);
        TextInputEditText etName = dialogView.findViewById(R.id.etAddressName);
        TextInputEditText etPhone = dialogView.findViewById(R.id.etAddressPhone);
        TextInputEditText etAddress = dialogView.findViewById(R.id.etAddressDetail);

        if (existingAddress != null) {
            etName.setText(existingAddress.getName());
            etPhone.setText(existingAddress.getPhone());
            etAddress.setText(existingAddress.getAddress());
        }

        new AlertDialog.Builder(this)
                .setTitle(existingAddress == null ? "Thêm địa chỉ" : "Sửa địa chỉ")
                .setView(dialogView)
                .setPositiveButton("Lưu", (dialog, which) -> {
                    String name = etName.getText() != null ? etName.getText().toString().trim() : "";
                    String phone = etPhone.getText() != null ? etPhone.getText().toString().trim() : "";
                    String addressText = etAddress.getText() != null ? etAddress.getText().toString().trim() : "";
                    if (name.isEmpty() || phone.isEmpty() || addressText.isEmpty()) {
                        showMessage("Vui lòng nhập đủ thông tin địa chỉ");
                        return;
                    }
                    UserAddress address = existingAddress != null ? existingAddress : new UserAddress();
                    address.setType(type);
                    address.setLabel(type);
                    address.setName(name);
                    address.setPhone(phone);
                    address.setAddress(addressText);
                    FirestoreHelper.saveAddress(address, new FirestoreHelper.SimpleCallback() {
                        @Override
                        public void onSuccess() {
                            showMessage("Lưu địa chỉ thành công");
                            loadAddresses();
                        }

                        @Override
                        public void onFailure(String error) {
                            showMessage("Lưu địa chỉ thất bại: " + error);
                        }
                    });
                })
                .setNegativeButton("Hủy", null)
                .show();
    }

    private void deleteAddress(String type) {
        UserAddress address = type.equals("office") ? officeAddress : familyAddress;
        if (address == null || address.getId() == null) {
            showMessage("Không có địa chỉ để xóa");
            return;
        }
        FirestoreHelper.deleteAddress(address.getId(), new FirestoreHelper.SimpleCallback() {
            @Override
            public void onSuccess() {
                showMessage("Xóa địa chỉ thành công");
                loadAddresses();
            }

            @Override
            public void onFailure(String error) {
                showMessage("Xóa địa chỉ thất bại: " + error);
            }
        });
    }

    private void setDefaultAddress(String type) {
        UserAddress address;
        if (type.equals("office")) {
            address = officeAddress;
        } else {
            address = familyAddress;
        }
        if (address == null || address.getId() == null) {
            showMessage("Chọn địa chỉ để đặt mặc định");
            return;
        }
        address.setDefault(true);
        FirestoreHelper.saveAddress(address, new FirestoreHelper.SimpleCallback() {
            @Override
            public void onSuccess() {
                showMessage("Đã đặt địa chỉ này làm mặc định");
                loadAddresses();
            }

            @Override
            public void onFailure(String error) {
                showMessage("Cập nhật địa chỉ thất bại: " + error);
            }
        });
    }

    private void showMessage(String message) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
    }
}
