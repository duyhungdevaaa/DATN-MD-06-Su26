package fpoly.DatnMD06Su26.trendify.activity;

import android.os.Bundle;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import com.google.android.material.imageview.ShapeableImageView;
import com.google.android.material.textfield.TextInputEditText;

import fpoly.DatnMD06Su26.trendify.R;

public class EditProfileActivity extends AppCompatActivity {

    private ShapeableImageView ivAvatar;
    private LinearLayout btnChangeAvatar;
    private TextInputEditText etFullName, etEmail, etPhone;
    private Button btnSave;
    private ProgressBar progressBar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_edit_profile);

        initViews();
        setupToolbar();

        btnChangeAvatar.setOnClickListener(v -> {
            Toast.makeText(this, "Chức năng chọn ảnh sẽ được thêm sau", Toast.LENGTH_SHORT).show();
        });

        btnSave.setOnClickListener(v -> {
            Toast.makeText(this, "Chức năng lưu sẽ được thêm sau", Toast.LENGTH_SHORT).show();
        });
    }

    private void initViews() {
        ivAvatar = findViewById(R.id.ivAvatar);
        btnChangeAvatar = findViewById(R.id.btnChangeAvatar);
        etFullName = findViewById(R.id.etFullName);
        etEmail = findViewById(R.id.etEmail);
        etPhone = findViewById(R.id.etPhone);
        btnSave = findViewById(R.id.btnSave);
        progressBar = findViewById(R.id.progressBar);
    }

    private void setupToolbar() {
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setDisplayShowTitleEnabled(false);
        }
        toolbar.setNavigationOnClickListener(v -> finish());
    }
}
