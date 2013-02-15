namespace FBXConverter
{
	partial class FBXConverterForm
	{
		/// <summary>
		/// Required designer variable.
		/// </summary>
		private System.ComponentModel.IContainer components = null;

		/// <summary>
		/// Clean up any resources being used.
		/// </summary>
		/// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
		protected override void Dispose( bool disposing )
		{
			if ( disposing && (components != null) )
			{
				components.Dispose();
			}
			base.Dispose( disposing );
		}

		#region Windows Form Designer generated code

		/// <summary>
		/// Required method for Designer support - do not modify
		/// the contents of this method with the code editor.
		/// </summary>
		private void InitializeComponent()
		{
			this.components = new System.ComponentModel.Container();
			this.textBoxInfos = new System.Windows.Forms.TextBox();
			this.groupBoxMain = new System.Windows.Forms.GroupBox();
			this.comboBoxPreset = new System.Windows.Forms.ComboBox();
			this.label8 = new System.Windows.Forms.Label();
			this.checkBoxShowWarnings = new System.Windows.Forms.CheckBox();
			this.buttonRemovePreset = new System.Windows.Forms.Button();
			this.groupBoxOptions = new System.Windows.Forms.GroupBox();
			this.groupBox4 = new System.Windows.Forms.GroupBox();
			this.checkBoxExportAnimations = new System.Windows.Forms.CheckBox();
			this.textBoxOutputSceneFilesDirectory = new System.Windows.Forms.TextBox();
			this.radioButtonOutputFilesToDirectory = new System.Windows.Forms.RadioButton();
			this.buttonOutputSceneFiles = new System.Windows.Forms.Button();
			this.radioButtonGenerateTGZ = new System.Windows.Forms.RadioButton();
			this.checkBoxPrettyPrint = new System.Windows.Forms.CheckBox();
			this.groupBox3 = new System.Windows.Forms.GroupBox();
			this.labelError = new System.Windows.Forms.Label();
			this.textBoxScriptFile = new System.Windows.Forms.TextBox();
			this.buttonRebuildScript = new System.Windows.Forms.Button();
			this.buttonLoadScript = new System.Windows.Forms.Button();
			this.groupBoxMaterials = new System.Windows.Forms.GroupBox();
			this.radioButtonStoreTextureNames = new System.Windows.Forms.RadioButton();
			this.textBoxTexturesBaseDirectory = new System.Windows.Forms.TextBox();
			this.radioButtonStoreTextures = new System.Windows.Forms.RadioButton();
			this.buttonBrowseTextureBaseDirectory = new System.Windows.Forms.Button();
			this.groupBoxTextureConversion = new System.Windows.Forms.GroupBox();
			this.integerTrackbarControlJPGQuality = new FBXConverter.IntegerTrackbarControl();
			this.comboBoxConvertRegular = new System.Windows.Forms.ComboBox();
			this.label3 = new System.Windows.Forms.Label();
			this.label5 = new System.Windows.Forms.Label();
			this.label2 = new System.Windows.Forms.Label();
			this.label1 = new System.Windows.Forms.Label();
			this.checkBoxGenerateRegularMipMaps = new System.Windows.Forms.CheckBox();
			this.checkBoxGenerateNormalMipMaps = new System.Windows.Forms.CheckBox();
			this.checkBoxGenerateDiffuseMipMaps = new System.Windows.Forms.CheckBox();
			this.comboBoxConvertNormal = new System.Windows.Forms.ComboBox();
			this.comboBoxConvertDiffuse = new System.Windows.Forms.ComboBox();
			this.checkBoxCopyTexturesToBaseDirectory = new System.Windows.Forms.CheckBox();
			this.groupBox1 = new System.Windows.Forms.GroupBox();
			this.groupBox6 = new System.Windows.Forms.GroupBox();
			this.checkBoxGenerateTangentSpace = new System.Windows.Forms.CheckBox();
			this.label4 = new System.Windows.Forms.Label();
			this.radioButtonNoTSNotify = new System.Windows.Forms.RadioButton();
			this.radioButtonNoTSValidate = new System.Windows.Forms.RadioButton();
			this.radioButtonNoTSSkip = new System.Windows.Forms.RadioButton();
			this.groupBox5 = new System.Windows.Forms.GroupBox();
			this.checkBoxCompactMeshes = new System.Windows.Forms.CheckBox();
			this.integerTrackbarControlMinUVs = new FBXConverter.IntegerTrackbarControl();
			this.checkBoxCompactUVs = new System.Windows.Forms.CheckBox();
			this.label6 = new System.Windows.Forms.Label();
			this.label7 = new System.Windows.Forms.Label();
			this.checkBoxConsolidate = new System.Windows.Forms.CheckBox();
			this.groupBoxConsolidate = new System.Windows.Forms.GroupBox();
			this.checkBoxConsolidateSplitBySG = new System.Windows.Forms.CheckBox();
			this.checkBoxConsolidateSplitByColor = new System.Windows.Forms.CheckBox();
			this.checkBoxConsolidateSplitByUV = new System.Windows.Forms.CheckBox();
			this.groupBox2 = new System.Windows.Forms.GroupBox();
			this.checkBoxStorePivot = new System.Windows.Forms.CheckBox();
			this.checkBoxStoreHDRVertexColors = new System.Windows.Forms.CheckBox();
			this.checkBoxGenerateTriangleStrips = new System.Windows.Forms.CheckBox();
			this.checkBoxResetXForm = new System.Windows.Forms.CheckBox();
			this.checkBoxGenerateBBox = new System.Windows.Forms.CheckBox();
			this.buttonConvert = new System.Windows.Forms.Button();
			this.progressBar = new System.Windows.Forms.ProgressBar();
			this.openFileDialog = new System.Windows.Forms.OpenFileDialog();
			this.openScriptFileDialog = new System.Windows.Forms.OpenFileDialog();
			this.errorProvider = new System.Windows.Forms.ErrorProvider( this.components );
			this.folderBrowserDialog = new System.Windows.Forms.FolderBrowserDialog();
			this.folderBrowserDialogOutputSceneFiles = new System.Windows.Forms.FolderBrowserDialog();
			this.groupBoxMain.SuspendLayout();
			this.groupBoxOptions.SuspendLayout();
			this.groupBox4.SuspendLayout();
			this.groupBox3.SuspendLayout();
			this.groupBoxMaterials.SuspendLayout();
			this.groupBoxTextureConversion.SuspendLayout();
			this.groupBox1.SuspendLayout();
			this.groupBox6.SuspendLayout();
			this.groupBox5.SuspendLayout();
			this.groupBoxConsolidate.SuspendLayout();
			this.groupBox2.SuspendLayout();
			((System.ComponentModel.ISupportInitialize) (this.errorProvider)).BeginInit();
			this.SuspendLayout();
			// 
			// textBoxInfos
			// 
			this.textBoxInfos.Anchor = ((System.Windows.Forms.AnchorStyles) (((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left)
						| System.Windows.Forms.AnchorStyles.Right)));
			this.textBoxInfos.BackColor = System.Drawing.SystemColors.Info;
			this.textBoxInfos.Location = new System.Drawing.Point( 12, 12 );
			this.textBoxInfos.Multiline = true;
			this.textBoxInfos.Name = "textBoxInfos";
			this.textBoxInfos.ReadOnly = true;
			this.textBoxInfos.Size = new System.Drawing.Size( 1005, 100 );
			this.textBoxInfos.TabIndex = 3;
			this.textBoxInfos.TabStop = false;
			this.textBoxInfos.Text = "This application lets you convert FBX files into O3DTGZ scene files.";
			// 
			// groupBoxMain
			// 
			this.groupBoxMain.Anchor = ((System.Windows.Forms.AnchorStyles) ((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom)
						| System.Windows.Forms.AnchorStyles.Left)
						| System.Windows.Forms.AnchorStyles.Right)));
			this.groupBoxMain.Controls.Add( this.comboBoxPreset );
			this.groupBoxMain.Controls.Add( this.label8 );
			this.groupBoxMain.Controls.Add( this.checkBoxShowWarnings );
			this.groupBoxMain.Controls.Add( this.buttonRemovePreset );
			this.groupBoxMain.Controls.Add( this.groupBoxOptions );
			this.groupBoxMain.Controls.Add( this.buttonConvert );
			this.groupBoxMain.Location = new System.Drawing.Point( 12, 118 );
			this.groupBoxMain.Name = "groupBoxMain";
			this.groupBoxMain.Size = new System.Drawing.Size( 1005, 662 );
			this.groupBoxMain.TabIndex = 4;
			this.groupBoxMain.TabStop = false;
			this.groupBoxMain.Text = "Main";
			// 
			// comboBoxPreset
			// 
			this.comboBoxPreset.Anchor = ((System.Windows.Forms.AnchorStyles) ((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
			this.comboBoxPreset.FormattingEnabled = true;
			this.comboBoxPreset.Location = new System.Drawing.Point( 816, 48 );
			this.comboBoxPreset.Name = "comboBoxPreset";
			this.comboBoxPreset.Size = new System.Drawing.Size( 150, 21 );
			this.comboBoxPreset.TabIndex = 1;
			this.comboBoxPreset.Validating += new System.ComponentModel.CancelEventHandler( this.comboBoxPreset_Validating );
			this.comboBoxPreset.SelectedValueChanged += new System.EventHandler( this.comboBoxPreset_SelectedValueChanged );
			// 
			// label8
			// 
			this.label8.Anchor = ((System.Windows.Forms.AnchorStyles) ((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
			this.label8.AutoSize = true;
			this.label8.Location = new System.Drawing.Point( 773, 52 );
			this.label8.Name = "label8";
			this.label8.Size = new System.Drawing.Size( 43, 13 );
			this.label8.TabIndex = 2;
			this.label8.Text = "Preset :";
			// 
			// checkBoxShowWarnings
			// 
			this.checkBoxShowWarnings.AutoSize = true;
			this.checkBoxShowWarnings.Checked = true;
			this.checkBoxShowWarnings.CheckState = System.Windows.Forms.CheckState.Checked;
			this.checkBoxShowWarnings.Location = new System.Drawing.Point( 498, 28 );
			this.checkBoxShowWarnings.Name = "checkBoxShowWarnings";
			this.checkBoxShowWarnings.Size = new System.Drawing.Size( 98, 17 );
			this.checkBoxShowWarnings.TabIndex = 2;
			this.checkBoxShowWarnings.Text = "Show warnings";
			this.checkBoxShowWarnings.UseVisualStyleBackColor = true;
			// 
			// buttonRemovePreset
			// 
			this.buttonRemovePreset.Anchor = ((System.Windows.Forms.AnchorStyles) ((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
			this.buttonRemovePreset.BackgroundImage = global::FBXConverter.Properties.Resources.Remove;
			this.buttonRemovePreset.BackgroundImageLayout = System.Windows.Forms.ImageLayout.Center;
			this.buttonRemovePreset.Location = new System.Drawing.Point( 969, 49 );
			this.buttonRemovePreset.Name = "buttonRemovePreset";
			this.buttonRemovePreset.Size = new System.Drawing.Size( 18, 18 );
			this.buttonRemovePreset.TabIndex = 2;
			this.buttonRemovePreset.Text = "...";
			this.buttonRemovePreset.UseVisualStyleBackColor = false;
			this.buttonRemovePreset.Click += new System.EventHandler( this.buttonRemovePreset_Click );
			// 
			// groupBoxOptions
			// 
			this.groupBoxOptions.Controls.Add( this.groupBox4 );
			this.groupBoxOptions.Controls.Add( this.textBoxOutputSceneFilesDirectory );
			this.groupBoxOptions.Controls.Add( this.radioButtonOutputFilesToDirectory );
			this.groupBoxOptions.Controls.Add( this.buttonOutputSceneFiles );
			this.groupBoxOptions.Controls.Add( this.radioButtonGenerateTGZ );
			this.groupBoxOptions.Controls.Add( this.checkBoxPrettyPrint );
			this.groupBoxOptions.Controls.Add( this.groupBox3 );
			this.groupBoxOptions.Controls.Add( this.groupBoxMaterials );
			this.groupBoxOptions.Controls.Add( this.groupBox1 );
			this.groupBoxOptions.Location = new System.Drawing.Point( 6, 53 );
			this.groupBoxOptions.Name = "groupBoxOptions";
			this.groupBoxOptions.Size = new System.Drawing.Size( 976, 601 );
			this.groupBoxOptions.TabIndex = 1;
			this.groupBoxOptions.TabStop = false;
			this.groupBoxOptions.Text = "Options";
			// 
			// groupBox4
			// 
			this.groupBox4.Controls.Add( this.checkBoxExportAnimations );
			this.groupBox4.Location = new System.Drawing.Point( 660, 105 );
			this.groupBox4.Name = "groupBox4";
			this.groupBox4.Size = new System.Drawing.Size( 304, 488 );
			this.groupBox4.TabIndex = 4;
			this.groupBox4.TabStop = false;
			this.groupBox4.Text = "Animation";
			// 
			// checkBoxExportAnimations
			// 
			this.checkBoxExportAnimations.AutoSize = true;
			this.checkBoxExportAnimations.Checked = true;
			this.checkBoxExportAnimations.CheckState = System.Windows.Forms.CheckState.Checked;
			this.checkBoxExportAnimations.Location = new System.Drawing.Point( 6, 19 );
			this.checkBoxExportAnimations.Name = "checkBoxExportAnimations";
			this.checkBoxExportAnimations.Size = new System.Drawing.Size( 109, 17 );
			this.checkBoxExportAnimations.TabIndex = 0;
			this.checkBoxExportAnimations.Text = "Export animations";
			this.checkBoxExportAnimations.UseVisualStyleBackColor = true;
			// 
			// textBoxOutputSceneFilesDirectory
			// 
			this.textBoxOutputSceneFilesDirectory.Anchor = ((System.Windows.Forms.AnchorStyles) (((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left)
						| System.Windows.Forms.AnchorStyles.Right)));
			this.textBoxOutputSceneFilesDirectory.Location = new System.Drawing.Point( 614, 51 );
			this.textBoxOutputSceneFilesDirectory.Name = "textBoxOutputSceneFilesDirectory";
			this.textBoxOutputSceneFilesDirectory.Size = new System.Drawing.Size( 251, 20 );
			this.textBoxOutputSceneFilesDirectory.TabIndex = 2;
			// 
			// radioButtonOutputFilesToDirectory
			// 
			this.radioButtonOutputFilesToDirectory.AutoSize = true;
			this.radioButtonOutputFilesToDirectory.Location = new System.Drawing.Point( 481, 52 );
			this.radioButtonOutputFilesToDirectory.Name = "radioButtonOutputFilesToDirectory";
			this.radioButtonOutputFilesToDirectory.Size = new System.Drawing.Size( 127, 17 );
			this.radioButtonOutputFilesToDirectory.TabIndex = 3;
			this.radioButtonOutputFilesToDirectory.Text = "Output Scene Files to";
			this.radioButtonOutputFilesToDirectory.UseVisualStyleBackColor = true;
			// 
			// buttonOutputSceneFiles
			// 
			this.buttonOutputSceneFiles.Anchor = ((System.Windows.Forms.AnchorStyles) ((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
			this.buttonOutputSceneFiles.Location = new System.Drawing.Point( 871, 51 );
			this.buttonOutputSceneFiles.Name = "buttonOutputSceneFiles";
			this.buttonOutputSceneFiles.Size = new System.Drawing.Size( 25, 20 );
			this.buttonOutputSceneFiles.TabIndex = 0;
			this.buttonOutputSceneFiles.Text = "...";
			this.buttonOutputSceneFiles.UseVisualStyleBackColor = true;
			this.buttonOutputSceneFiles.Click += new System.EventHandler( this.buttonOutputSceneFiles_Click );
			// 
			// radioButtonGenerateTGZ
			// 
			this.radioButtonGenerateTGZ.AutoSize = true;
			this.radioButtonGenerateTGZ.Checked = true;
			this.radioButtonGenerateTGZ.Location = new System.Drawing.Point( 481, 29 );
			this.radioButtonGenerateTGZ.Name = "radioButtonGenerateTGZ";
			this.radioButtonGenerateTGZ.Size = new System.Drawing.Size( 127, 17 );
			this.radioButtonGenerateTGZ.TabIndex = 3;
			this.radioButtonGenerateTGZ.TabStop = true;
			this.radioButtonGenerateTGZ.Text = "Generate O3TGZ File";
			this.radioButtonGenerateTGZ.UseVisualStyleBackColor = true;
			// 
			// checkBoxPrettyPrint
			// 
			this.checkBoxPrettyPrint.AutoSize = true;
			this.checkBoxPrettyPrint.Checked = true;
			this.checkBoxPrettyPrint.CheckState = System.Windows.Forms.CheckState.Checked;
			this.checkBoxPrettyPrint.Location = new System.Drawing.Point( 377, 30 );
			this.checkBoxPrettyPrint.Name = "checkBoxPrettyPrint";
			this.checkBoxPrettyPrint.Size = new System.Drawing.Size( 77, 17 );
			this.checkBoxPrettyPrint.TabIndex = 2;
			this.checkBoxPrettyPrint.Text = "Pretty Print";
			this.checkBoxPrettyPrint.UseVisualStyleBackColor = true;
			// 
			// groupBox3
			// 
			this.groupBox3.Controls.Add( this.labelError );
			this.groupBox3.Controls.Add( this.textBoxScriptFile );
			this.groupBox3.Controls.Add( this.buttonRebuildScript );
			this.groupBox3.Controls.Add( this.buttonLoadScript );
			this.groupBox3.Location = new System.Drawing.Point( 7, 20 );
			this.groupBox3.Name = "groupBox3";
			this.groupBox3.Size = new System.Drawing.Size( 364, 79 );
			this.groupBox3.TabIndex = 3;
			this.groupBox3.TabStop = false;
			this.groupBox3.Text = "Conversion Script";
			// 
			// labelError
			// 
			this.labelError.Anchor = ((System.Windows.Forms.AnchorStyles) (((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left)
						| System.Windows.Forms.AnchorStyles.Right)));
			this.labelError.Location = new System.Drawing.Point( 107, 51 );
			this.labelError.Name = "labelError";
			this.labelError.Size = new System.Drawing.Size( 250, 18 );
			this.labelError.TabIndex = 3;
			this.labelError.Text = "Assembly not built yet...";
			// 
			// textBoxScriptFile
			// 
			this.textBoxScriptFile.Anchor = ((System.Windows.Forms.AnchorStyles) (((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left)
						| System.Windows.Forms.AnchorStyles.Right)));
			this.textBoxScriptFile.Location = new System.Drawing.Point( 7, 20 );
			this.textBoxScriptFile.Name = "textBoxScriptFile";
			this.textBoxScriptFile.Size = new System.Drawing.Size( 320, 20 );
			this.textBoxScriptFile.TabIndex = 2;
			// 
			// buttonRebuildScript
			// 
			this.buttonRebuildScript.Location = new System.Drawing.Point( 7, 46 );
			this.buttonRebuildScript.Name = "buttonRebuildScript";
			this.buttonRebuildScript.Size = new System.Drawing.Size( 75, 23 );
			this.buttonRebuildScript.TabIndex = 1;
			this.buttonRebuildScript.Text = "Rebuild";
			this.buttonRebuildScript.UseVisualStyleBackColor = true;
			this.buttonRebuildScript.Click += new System.EventHandler( this.buttonRebuildScript_Click );
			// 
			// buttonLoadScript
			// 
			this.buttonLoadScript.Anchor = ((System.Windows.Forms.AnchorStyles) ((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
			this.buttonLoadScript.Location = new System.Drawing.Point( 332, 20 );
			this.buttonLoadScript.Name = "buttonLoadScript";
			this.buttonLoadScript.Size = new System.Drawing.Size( 25, 20 );
			this.buttonLoadScript.TabIndex = 0;
			this.buttonLoadScript.Text = "...";
			this.buttonLoadScript.UseVisualStyleBackColor = true;
			this.buttonLoadScript.Click += new System.EventHandler( this.buttonLoadScript_Click );
			// 
			// groupBoxMaterials
			// 
			this.groupBoxMaterials.Controls.Add( this.radioButtonStoreTextureNames );
			this.groupBoxMaterials.Controls.Add( this.textBoxTexturesBaseDirectory );
			this.groupBoxMaterials.Controls.Add( this.radioButtonStoreTextures );
			this.groupBoxMaterials.Controls.Add( this.buttonBrowseTextureBaseDirectory );
			this.groupBoxMaterials.Controls.Add( this.groupBoxTextureConversion );
			this.groupBoxMaterials.Controls.Add( this.checkBoxCopyTexturesToBaseDirectory );
			this.groupBoxMaterials.Location = new System.Drawing.Point( 326, 105 );
			this.groupBoxMaterials.Name = "groupBoxMaterials";
			this.groupBoxMaterials.Size = new System.Drawing.Size( 328, 488 );
			this.groupBoxMaterials.TabIndex = 2;
			this.groupBoxMaterials.TabStop = false;
			this.groupBoxMaterials.Text = "Materials && Textures";
			// 
			// radioButtonStoreTextureNames
			// 
			this.radioButtonStoreTextureNames.AutoSize = true;
			this.radioButtonStoreTextureNames.Location = new System.Drawing.Point( 6, 41 );
			this.radioButtonStoreTextureNames.Name = "radioButtonStoreTextureNames";
			this.radioButtonStoreTextureNames.Size = new System.Drawing.Size( 163, 17 );
			this.radioButtonStoreTextureNames.TabIndex = 3;
			this.radioButtonStoreTextureNames.Text = "Store Delay-Loaded Textures";
			this.radioButtonStoreTextureNames.UseVisualStyleBackColor = true;
			// 
			// textBoxTexturesBaseDirectory
			// 
			this.textBoxTexturesBaseDirectory.Anchor = ((System.Windows.Forms.AnchorStyles) (((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left)
						| System.Windows.Forms.AnchorStyles.Right)));
			this.textBoxTexturesBaseDirectory.Location = new System.Drawing.Point( 16, 87 );
			this.textBoxTexturesBaseDirectory.Name = "textBoxTexturesBaseDirectory";
			this.textBoxTexturesBaseDirectory.Size = new System.Drawing.Size( 275, 20 );
			this.textBoxTexturesBaseDirectory.TabIndex = 2;
			this.textBoxTexturesBaseDirectory.Text = ".\\";
			// 
			// radioButtonStoreTextures
			// 
			this.radioButtonStoreTextures.AutoSize = true;
			this.radioButtonStoreTextures.Checked = true;
			this.radioButtonStoreTextures.Location = new System.Drawing.Point( 7, 18 );
			this.radioButtonStoreTextures.Name = "radioButtonStoreTextures";
			this.radioButtonStoreTextures.Size = new System.Drawing.Size( 186, 17 );
			this.radioButtonStoreTextures.TabIndex = 3;
			this.radioButtonStoreTextures.TabStop = true;
			this.radioButtonStoreTextures.Text = "Embed Textures in Scene Archive";
			this.radioButtonStoreTextures.UseVisualStyleBackColor = true;
			// 
			// buttonBrowseTextureBaseDirectory
			// 
			this.buttonBrowseTextureBaseDirectory.Anchor = ((System.Windows.Forms.AnchorStyles) ((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
			this.buttonBrowseTextureBaseDirectory.Location = new System.Drawing.Point( 297, 87 );
			this.buttonBrowseTextureBaseDirectory.Name = "buttonBrowseTextureBaseDirectory";
			this.buttonBrowseTextureBaseDirectory.Size = new System.Drawing.Size( 25, 20 );
			this.buttonBrowseTextureBaseDirectory.TabIndex = 0;
			this.buttonBrowseTextureBaseDirectory.Text = "...";
			this.buttonBrowseTextureBaseDirectory.UseVisualStyleBackColor = true;
			this.buttonBrowseTextureBaseDirectory.Click += new System.EventHandler( this.buttonBrowseTextureBaseDirectory_Click );
			// 
			// groupBoxTextureConversion
			// 
			this.groupBoxTextureConversion.Controls.Add( this.integerTrackbarControlJPGQuality );
			this.groupBoxTextureConversion.Controls.Add( this.comboBoxConvertRegular );
			this.groupBoxTextureConversion.Controls.Add( this.label3 );
			this.groupBoxTextureConversion.Controls.Add( this.label5 );
			this.groupBoxTextureConversion.Controls.Add( this.label2 );
			this.groupBoxTextureConversion.Controls.Add( this.label1 );
			this.groupBoxTextureConversion.Controls.Add( this.checkBoxGenerateRegularMipMaps );
			this.groupBoxTextureConversion.Controls.Add( this.checkBoxGenerateNormalMipMaps );
			this.groupBoxTextureConversion.Controls.Add( this.checkBoxGenerateDiffuseMipMaps );
			this.groupBoxTextureConversion.Controls.Add( this.comboBoxConvertNormal );
			this.groupBoxTextureConversion.Controls.Add( this.comboBoxConvertDiffuse );
			this.groupBoxTextureConversion.Location = new System.Drawing.Point( 7, 122 );
			this.groupBoxTextureConversion.Name = "groupBoxTextureConversion";
			this.groupBoxTextureConversion.Size = new System.Drawing.Size( 307, 202 );
			this.groupBoxTextureConversion.TabIndex = 2;
			this.groupBoxTextureConversion.TabStop = false;
			this.groupBoxTextureConversion.Text = "Textures Conversion";
			// 
			// integerTrackbarControlJPGQuality
			// 
			this.integerTrackbarControlJPGQuality.Anchor = ((System.Windows.Forms.AnchorStyles) (((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left)
						| System.Windows.Forms.AnchorStyles.Right)));
			this.integerTrackbarControlJPGQuality.Location = new System.Drawing.Point( 82, 171 );
			this.integerTrackbarControlJPGQuality.MaximumSize = new System.Drawing.Size( 10000, 20 );
			this.integerTrackbarControlJPGQuality.MinimumSize = new System.Drawing.Size( 70, 20 );
			this.integerTrackbarControlJPGQuality.Name = "integerTrackbarControlJPGQuality";
			this.integerTrackbarControlJPGQuality.RangeMax = 100;
			this.integerTrackbarControlJPGQuality.RangeMin = 0;
			this.integerTrackbarControlJPGQuality.Size = new System.Drawing.Size( 214, 20 );
			this.integerTrackbarControlJPGQuality.TabIndex = 3;
			this.integerTrackbarControlJPGQuality.Value = 80;
			// 
			// comboBoxConvertRegular
			// 
			this.comboBoxConvertRegular.DropDownStyle = System.Windows.Forms.ComboBoxStyle.DropDownList;
			this.comboBoxConvertRegular.FormattingEnabled = true;
			this.comboBoxConvertRegular.Items.AddRange( new object[] {
            "No Conversion",
            "JPG",
            "PNG",
            "DDS",
            "DXT1",
            "DXT2",
            "DXT3",
            "DXT5"} );
			this.comboBoxConvertRegular.Location = new System.Drawing.Point( 178, 114 );
			this.comboBoxConvertRegular.Name = "comboBoxConvertRegular";
			this.comboBoxConvertRegular.Size = new System.Drawing.Size( 118, 21 );
			this.comboBoxConvertRegular.TabIndex = 1;
			// 
			// label3
			// 
			this.label3.AutoSize = true;
			this.label3.Location = new System.Drawing.Point( 7, 117 );
			this.label3.Name = "label3";
			this.label3.Size = new System.Drawing.Size( 163, 13 );
			this.label3.TabIndex = 2;
			this.label3.Text = "Convert REGULAR Textures into";
			// 
			// label5
			// 
			this.label5.AutoSize = true;
			this.label5.Location = new System.Drawing.Point( 7, 176 );
			this.label5.Name = "label5";
			this.label5.Size = new System.Drawing.Size( 69, 13 );
			this.label5.TabIndex = 2;
			this.label5.Text = "JPEG Quality";
			// 
			// label2
			// 
			this.label2.AutoSize = true;
			this.label2.Location = new System.Drawing.Point( 7, 62 );
			this.label2.Name = "label2";
			this.label2.Size = new System.Drawing.Size( 157, 13 );
			this.label2.TabIndex = 2;
			this.label2.Text = "Convert NORMAL Textures into";
			// 
			// label1
			// 
			this.label1.AutoSize = true;
			this.label1.Location = new System.Drawing.Point( 7, 20 );
			this.label1.Name = "label1";
			this.label1.Size = new System.Drawing.Size( 156, 13 );
			this.label1.TabIndex = 2;
			this.label1.Text = "Convert DIFFUSE Textures into";
			// 
			// checkBoxGenerateRegularMipMaps
			// 
			this.checkBoxGenerateRegularMipMaps.AutoSize = true;
			this.checkBoxGenerateRegularMipMaps.Checked = true;
			this.checkBoxGenerateRegularMipMaps.CheckState = System.Windows.Forms.CheckState.Checked;
			this.checkBoxGenerateRegularMipMaps.Location = new System.Drawing.Point( 10, 133 );
			this.checkBoxGenerateRegularMipMaps.Name = "checkBoxGenerateRegularMipMaps";
			this.checkBoxGenerateRegularMipMaps.Size = new System.Drawing.Size( 140, 17 );
			this.checkBoxGenerateRegularMipMaps.TabIndex = 0;
			this.checkBoxGenerateRegularMipMaps.Text = "and Generate Mip-Maps";
			this.checkBoxGenerateRegularMipMaps.UseVisualStyleBackColor = true;
			// 
			// checkBoxGenerateNormalMipMaps
			// 
			this.checkBoxGenerateNormalMipMaps.AutoSize = true;
			this.checkBoxGenerateNormalMipMaps.Checked = true;
			this.checkBoxGenerateNormalMipMaps.CheckState = System.Windows.Forms.CheckState.Checked;
			this.checkBoxGenerateNormalMipMaps.Location = new System.Drawing.Point( 10, 78 );
			this.checkBoxGenerateNormalMipMaps.Name = "checkBoxGenerateNormalMipMaps";
			this.checkBoxGenerateNormalMipMaps.Size = new System.Drawing.Size( 140, 17 );
			this.checkBoxGenerateNormalMipMaps.TabIndex = 0;
			this.checkBoxGenerateNormalMipMaps.Text = "and Generate Mip-Maps";
			this.checkBoxGenerateNormalMipMaps.UseVisualStyleBackColor = true;
			// 
			// checkBoxGenerateDiffuseMipMaps
			// 
			this.checkBoxGenerateDiffuseMipMaps.AutoSize = true;
			this.checkBoxGenerateDiffuseMipMaps.Checked = true;
			this.checkBoxGenerateDiffuseMipMaps.CheckState = System.Windows.Forms.CheckState.Checked;
			this.checkBoxGenerateDiffuseMipMaps.Location = new System.Drawing.Point( 10, 36 );
			this.checkBoxGenerateDiffuseMipMaps.Name = "checkBoxGenerateDiffuseMipMaps";
			this.checkBoxGenerateDiffuseMipMaps.Size = new System.Drawing.Size( 140, 17 );
			this.checkBoxGenerateDiffuseMipMaps.TabIndex = 0;
			this.checkBoxGenerateDiffuseMipMaps.Text = "and Generate Mip-Maps";
			this.checkBoxGenerateDiffuseMipMaps.UseVisualStyleBackColor = true;
			// 
			// comboBoxConvertNormal
			// 
			this.comboBoxConvertNormal.DropDownStyle = System.Windows.Forms.ComboBoxStyle.DropDownList;
			this.comboBoxConvertNormal.FormattingEnabled = true;
			this.comboBoxConvertNormal.Items.AddRange( new object[] {
            "No Conversion",
            "JPG",
            "PNG",
            "DDS",
            "DXT1",
            "DXT2",
            "DXT3",
            "DXT5"} );
			this.comboBoxConvertNormal.Location = new System.Drawing.Point( 178, 59 );
			this.comboBoxConvertNormal.Name = "comboBoxConvertNormal";
			this.comboBoxConvertNormal.Size = new System.Drawing.Size( 118, 21 );
			this.comboBoxConvertNormal.TabIndex = 1;
			// 
			// comboBoxConvertDiffuse
			// 
			this.comboBoxConvertDiffuse.DropDownStyle = System.Windows.Forms.ComboBoxStyle.DropDownList;
			this.comboBoxConvertDiffuse.FormattingEnabled = true;
			this.comboBoxConvertDiffuse.Items.AddRange( new object[] {
            "No Conversion",
            "JPG",
            "PNG",
            "DDS",
            "DXT1",
            "DXT2",
            "DXT3",
            "DXT5"} );
			this.comboBoxConvertDiffuse.Location = new System.Drawing.Point( 178, 17 );
			this.comboBoxConvertDiffuse.Name = "comboBoxConvertDiffuse";
			this.comboBoxConvertDiffuse.Size = new System.Drawing.Size( 118, 21 );
			this.comboBoxConvertDiffuse.TabIndex = 1;
			// 
			// checkBoxCopyTexturesToBaseDirectory
			// 
			this.checkBoxCopyTexturesToBaseDirectory.AutoSize = true;
			this.checkBoxCopyTexturesToBaseDirectory.Location = new System.Drawing.Point( 16, 64 );
			this.checkBoxCopyTexturesToBaseDirectory.Name = "checkBoxCopyTexturesToBaseDirectory";
			this.checkBoxCopyTexturesToBaseDirectory.Size = new System.Drawing.Size( 234, 17 );
			this.checkBoxCopyTexturesToBaseDirectory.TabIndex = 0;
			this.checkBoxCopyTexturesToBaseDirectory.Text = "And copy textures to the following directory :";
			this.checkBoxCopyTexturesToBaseDirectory.UseVisualStyleBackColor = true;
			// 
			// groupBox1
			// 
			this.groupBox1.Controls.Add( this.groupBox6 );
			this.groupBox1.Controls.Add( this.groupBox5 );
			this.groupBox1.Controls.Add( this.checkBoxConsolidate );
			this.groupBox1.Controls.Add( this.groupBoxConsolidate );
			this.groupBox1.Controls.Add( this.groupBox2 );
			this.groupBox1.Controls.Add( this.checkBoxStoreHDRVertexColors );
			this.groupBox1.Controls.Add( this.checkBoxGenerateTriangleStrips );
			this.groupBox1.Controls.Add( this.checkBoxResetXForm );
			this.groupBox1.Controls.Add( this.checkBoxGenerateBBox );
			this.groupBox1.Location = new System.Drawing.Point( 7, 105 );
			this.groupBox1.Name = "groupBox1";
			this.groupBox1.Size = new System.Drawing.Size( 313, 488 );
			this.groupBox1.TabIndex = 1;
			this.groupBox1.TabStop = false;
			this.groupBox1.Text = "Meshes";
			// 
			// groupBox6
			// 
			this.groupBox6.Controls.Add( this.checkBoxGenerateTangentSpace );
			this.groupBox6.Controls.Add( this.label4 );
			this.groupBox6.Controls.Add( this.radioButtonNoTSNotify );
			this.groupBox6.Controls.Add( this.radioButtonNoTSValidate );
			this.groupBox6.Controls.Add( this.radioButtonNoTSSkip );
			this.groupBox6.Location = new System.Drawing.Point( 6, 65 );
			this.groupBox6.Name = "groupBox6";
			this.groupBox6.Size = new System.Drawing.Size( 301, 77 );
			this.groupBox6.TabIndex = 6;
			this.groupBox6.TabStop = false;
			this.groupBox6.Text = "Normals && Tangent Space";
			// 
			// checkBoxGenerateTangentSpace
			// 
			this.checkBoxGenerateTangentSpace.AutoSize = true;
			this.checkBoxGenerateTangentSpace.Checked = true;
			this.checkBoxGenerateTangentSpace.CheckState = System.Windows.Forms.CheckState.Checked;
			this.checkBoxGenerateTangentSpace.Location = new System.Drawing.Point( 6, 19 );
			this.checkBoxGenerateTangentSpace.Name = "checkBoxGenerateTangentSpace";
			this.checkBoxGenerateTangentSpace.Size = new System.Drawing.Size( 185, 17 );
			this.checkBoxGenerateTangentSpace.TabIndex = 0;
			this.checkBoxGenerateTangentSpace.Text = "Generate Missing Tangent Space";
			this.checkBoxGenerateTangentSpace.UseVisualStyleBackColor = true;
			// 
			// label4
			// 
			this.label4.AutoSize = true;
			this.label4.Location = new System.Drawing.Point( 34, 37 );
			this.label4.Name = "label4";
			this.label4.Size = new System.Drawing.Size( 201, 13 );
			this.label4.TabIndex = 4;
			this.label4.Text = "If Tangent Space cannot be generated...";
			// 
			// radioButtonNoTSNotify
			// 
			this.radioButtonNoTSNotify.AutoSize = true;
			this.radioButtonNoTSNotify.Checked = true;
			this.radioButtonNoTSNotify.Location = new System.Drawing.Point( 37, 54 );
			this.radioButtonNoTSNotify.Name = "radioButtonNoTSNotify";
			this.radioButtonNoTSNotify.Size = new System.Drawing.Size( 52, 17 );
			this.radioButtonNoTSNotify.TabIndex = 3;
			this.radioButtonNoTSNotify.TabStop = true;
			this.radioButtonNoTSNotify.Text = "Notify";
			this.radioButtonNoTSNotify.UseVisualStyleBackColor = true;
			// 
			// radioButtonNoTSValidate
			// 
			this.radioButtonNoTSValidate.AutoSize = true;
			this.radioButtonNoTSValidate.Location = new System.Drawing.Point( 154, 54 );
			this.radioButtonNoTSValidate.Name = "radioButtonNoTSValidate";
			this.radioButtonNoTSValidate.Size = new System.Drawing.Size( 90, 17 );
			this.radioButtonNoTSValidate.TabIndex = 3;
			this.radioButtonNoTSValidate.Text = "Store Anyway";
			this.radioButtonNoTSValidate.UseVisualStyleBackColor = true;
			// 
			// radioButtonNoTSSkip
			// 
			this.radioButtonNoTSSkip.AutoSize = true;
			this.radioButtonNoTSSkip.Location = new System.Drawing.Point( 95, 54 );
			this.radioButtonNoTSSkip.Name = "radioButtonNoTSSkip";
			this.radioButtonNoTSSkip.Size = new System.Drawing.Size( 46, 17 );
			this.radioButtonNoTSSkip.TabIndex = 3;
			this.radioButtonNoTSSkip.Text = "Skip";
			this.radioButtonNoTSSkip.UseVisualStyleBackColor = true;
			// 
			// groupBox5
			// 
			this.groupBox5.Controls.Add( this.checkBoxCompactMeshes );
			this.groupBox5.Controls.Add( this.integerTrackbarControlMinUVs );
			this.groupBox5.Controls.Add( this.checkBoxCompactUVs );
			this.groupBox5.Controls.Add( this.label6 );
			this.groupBox5.Controls.Add( this.label7 );
			this.groupBox5.Location = new System.Drawing.Point( 6, 148 );
			this.groupBox5.Name = "groupBox5";
			this.groupBox5.Size = new System.Drawing.Size( 301, 100 );
			this.groupBox5.TabIndex = 5;
			this.groupBox5.TabStop = false;
			this.groupBox5.Text = "Compacting";
			// 
			// checkBoxCompactMeshes
			// 
			this.checkBoxCompactMeshes.AutoSize = true;
			this.checkBoxCompactMeshes.Checked = true;
			this.checkBoxCompactMeshes.CheckState = System.Windows.Forms.CheckState.Checked;
			this.checkBoxCompactMeshes.Location = new System.Drawing.Point( 6, 19 );
			this.checkBoxCompactMeshes.Name = "checkBoxCompactMeshes";
			this.checkBoxCompactMeshes.Size = new System.Drawing.Size( 243, 17 );
			this.checkBoxCompactMeshes.TabIndex = 2;
			this.checkBoxCompactMeshes.Text = "Compact identical meshes (i.e. use instancing)";
			this.checkBoxCompactMeshes.UseVisualStyleBackColor = true;
			this.checkBoxCompactMeshes.CheckedChanged += new System.EventHandler( this.checkBoxCompactMeshes_CheckedChanged );
			// 
			// integerTrackbarControlMinUVs
			// 
			this.integerTrackbarControlMinUVs.Location = new System.Drawing.Point( 126, 59 );
			this.integerTrackbarControlMinUVs.MaximumSize = new System.Drawing.Size( 10000, 20 );
			this.integerTrackbarControlMinUVs.MinimumSize = new System.Drawing.Size( 70, 20 );
			this.integerTrackbarControlMinUVs.Name = "integerTrackbarControlMinUVs";
			this.integerTrackbarControlMinUVs.RangeMax = 8;
			this.integerTrackbarControlMinUVs.RangeMin = 1;
			this.integerTrackbarControlMinUVs.Size = new System.Drawing.Size( 113, 20 );
			this.integerTrackbarControlMinUVs.TabIndex = 3;
			this.integerTrackbarControlMinUVs.Value = 1;
			this.integerTrackbarControlMinUVs.VisibleRangeMax = 8;
			this.integerTrackbarControlMinUVs.VisibleRangeMin = 1;
			// 
			// checkBoxCompactUVs
			// 
			this.checkBoxCompactUVs.AutoSize = true;
			this.checkBoxCompactUVs.Checked = true;
			this.checkBoxCompactUVs.CheckState = System.Windows.Forms.CheckState.Checked;
			this.checkBoxCompactUVs.Location = new System.Drawing.Point( 6, 42 );
			this.checkBoxCompactUVs.Name = "checkBoxCompactUVs";
			this.checkBoxCompactUVs.Size = new System.Drawing.Size( 150, 17 );
			this.checkBoxCompactUVs.TabIndex = 2;
			this.checkBoxCompactUVs.Text = "Compact identical UV sets";
			this.checkBoxCompactUVs.UseVisualStyleBackColor = true;
			// 
			// label6
			// 
			this.label6.AutoSize = true;
			this.label6.Location = new System.Drawing.Point( 33, 62 );
			this.label6.Name = "label6";
			this.label6.Size = new System.Drawing.Size( 87, 13 );
			this.label6.TabIndex = 2;
			this.label6.Text = "But keep at least";
			// 
			// label7
			// 
			this.label7.AutoSize = true;
			this.label7.Location = new System.Drawing.Point( 245, 62 );
			this.label7.Name = "label7";
			this.label7.Size = new System.Drawing.Size( 26, 13 );
			this.label7.TabIndex = 2;
			this.label7.Text = "sets";
			// 
			// checkBoxConsolidate
			// 
			this.checkBoxConsolidate.AutoSize = true;
			this.checkBoxConsolidate.Checked = true;
			this.checkBoxConsolidate.CheckState = System.Windows.Forms.CheckState.Checked;
			this.checkBoxConsolidate.Location = new System.Drawing.Point( 12, 255 );
			this.checkBoxConsolidate.Name = "checkBoxConsolidate";
			this.checkBoxConsolidate.Size = new System.Drawing.Size( 15, 14 );
			this.checkBoxConsolidate.TabIndex = 0;
			this.checkBoxConsolidate.UseVisualStyleBackColor = true;
			this.checkBoxConsolidate.CheckedChanged += new System.EventHandler( this.checkBoxConsolidate_CheckedChanged );
			// 
			// groupBoxConsolidate
			// 
			this.groupBoxConsolidate.Controls.Add( this.checkBoxConsolidateSplitBySG );
			this.groupBoxConsolidate.Controls.Add( this.checkBoxConsolidateSplitByColor );
			this.groupBoxConsolidate.Controls.Add( this.checkBoxConsolidateSplitByUV );
			this.groupBoxConsolidate.Location = new System.Drawing.Point( 6, 254 );
			this.groupBoxConsolidate.Name = "groupBoxConsolidate";
			this.groupBoxConsolidate.Size = new System.Drawing.Size( 301, 92 );
			this.groupBoxConsolidate.TabIndex = 2;
			this.groupBoxConsolidate.TabStop = false;
			this.groupBoxConsolidate.Text = "    Consolidation";
			// 
			// checkBoxConsolidateSplitBySG
			// 
			this.checkBoxConsolidateSplitBySG.AutoSize = true;
			this.checkBoxConsolidateSplitBySG.Checked = true;
			this.checkBoxConsolidateSplitBySG.CheckState = System.Windows.Forms.CheckState.Checked;
			this.checkBoxConsolidateSplitBySG.Location = new System.Drawing.Point( 6, 20 );
			this.checkBoxConsolidateSplitBySG.Name = "checkBoxConsolidateSplitBySG";
			this.checkBoxConsolidateSplitBySG.Size = new System.Drawing.Size( 186, 17 );
			this.checkBoxConsolidateSplitBySG.TabIndex = 0;
			this.checkBoxConsolidateSplitBySG.Text = "Split Vertices by Smoothing Group";
			this.checkBoxConsolidateSplitBySG.UseVisualStyleBackColor = true;
			// 
			// checkBoxConsolidateSplitByColor
			// 
			this.checkBoxConsolidateSplitByColor.AutoSize = true;
			this.checkBoxConsolidateSplitByColor.Checked = true;
			this.checkBoxConsolidateSplitByColor.CheckState = System.Windows.Forms.CheckState.Checked;
			this.checkBoxConsolidateSplitByColor.Location = new System.Drawing.Point( 6, 66 );
			this.checkBoxConsolidateSplitByColor.Name = "checkBoxConsolidateSplitByColor";
			this.checkBoxConsolidateSplitByColor.Size = new System.Drawing.Size( 128, 17 );
			this.checkBoxConsolidateSplitByColor.TabIndex = 0;
			this.checkBoxConsolidateSplitByColor.Text = "Split Vertices by Color";
			this.checkBoxConsolidateSplitByColor.UseVisualStyleBackColor = true;
			// 
			// checkBoxConsolidateSplitByUV
			// 
			this.checkBoxConsolidateSplitByUV.AutoSize = true;
			this.checkBoxConsolidateSplitByUV.Checked = true;
			this.checkBoxConsolidateSplitByUV.CheckState = System.Windows.Forms.CheckState.Checked;
			this.checkBoxConsolidateSplitByUV.Location = new System.Drawing.Point( 6, 43 );
			this.checkBoxConsolidateSplitByUV.Name = "checkBoxConsolidateSplitByUV";
			this.checkBoxConsolidateSplitByUV.Size = new System.Drawing.Size( 177, 17 );
			this.checkBoxConsolidateSplitByUV.TabIndex = 0;
			this.checkBoxConsolidateSplitByUV.Text = "Split Vertices by UV coordinates";
			this.checkBoxConsolidateSplitByUV.UseVisualStyleBackColor = true;
			// 
			// groupBox2
			// 
			this.groupBox2.Controls.Add( this.checkBoxStorePivot );
			this.groupBox2.Location = new System.Drawing.Point( 6, 398 );
			this.groupBox2.Name = "groupBox2";
			this.groupBox2.Size = new System.Drawing.Size( 301, 57 );
			this.groupBox2.TabIndex = 1;
			this.groupBox2.TabStop = false;
			this.groupBox2.Text = "Custom Data";
			// 
			// checkBoxStorePivot
			// 
			this.checkBoxStorePivot.AutoSize = true;
			this.checkBoxStorePivot.Location = new System.Drawing.Point( 6, 19 );
			this.checkBoxStorePivot.Name = "checkBoxStorePivot";
			this.checkBoxStorePivot.Size = new System.Drawing.Size( 77, 17 );
			this.checkBoxStorePivot.TabIndex = 0;
			this.checkBoxStorePivot.Text = "Store pivot";
			this.checkBoxStorePivot.UseVisualStyleBackColor = true;
			// 
			// checkBoxStoreHDRVertexColors
			// 
			this.checkBoxStoreHDRVertexColors.AutoSize = true;
			this.checkBoxStoreHDRVertexColors.Checked = true;
			this.checkBoxStoreHDRVertexColors.CheckState = System.Windows.Forms.CheckState.Checked;
			this.checkBoxStoreHDRVertexColors.Location = new System.Drawing.Point( 6, 352 );
			this.checkBoxStoreHDRVertexColors.Name = "checkBoxStoreHDRVertexColors";
			this.checkBoxStoreHDRVertexColors.Size = new System.Drawing.Size( 200, 17 );
			this.checkBoxStoreHDRVertexColors.TabIndex = 0;
			this.checkBoxStoreHDRVertexColors.Text = "Store Vertex Colors as TEXCOORDS";
			this.checkBoxStoreHDRVertexColors.UseVisualStyleBackColor = true;
			// 
			// checkBoxGenerateTriangleStrips
			// 
			this.checkBoxGenerateTriangleStrips.AutoSize = true;
			this.checkBoxGenerateTriangleStrips.Enabled = false;
			this.checkBoxGenerateTriangleStrips.Location = new System.Drawing.Point( 6, 42 );
			this.checkBoxGenerateTriangleStrips.Name = "checkBoxGenerateTriangleStrips";
			this.checkBoxGenerateTriangleStrips.Size = new System.Drawing.Size( 140, 17 );
			this.checkBoxGenerateTriangleStrips.TabIndex = 0;
			this.checkBoxGenerateTriangleStrips.Text = "Generate Triangle Strips";
			this.checkBoxGenerateTriangleStrips.UseVisualStyleBackColor = true;
			// 
			// checkBoxResetXForm
			// 
			this.checkBoxResetXForm.AutoSize = true;
			this.checkBoxResetXForm.Location = new System.Drawing.Point( 6, 375 );
			this.checkBoxResetXForm.Name = "checkBoxResetXForm";
			this.checkBoxResetXForm.Size = new System.Drawing.Size( 90, 17 );
			this.checkBoxResetXForm.TabIndex = 0;
			this.checkBoxResetXForm.Text = "Reset X-Form";
			this.checkBoxResetXForm.UseVisualStyleBackColor = true;
			// 
			// checkBoxGenerateBBox
			// 
			this.checkBoxGenerateBBox.AutoSize = true;
			this.checkBoxGenerateBBox.Checked = true;
			this.checkBoxGenerateBBox.CheckState = System.Windows.Forms.CheckState.Checked;
			this.checkBoxGenerateBBox.Location = new System.Drawing.Point( 6, 19 );
			this.checkBoxGenerateBBox.Name = "checkBoxGenerateBBox";
			this.checkBoxGenerateBBox.Size = new System.Drawing.Size( 150, 17 );
			this.checkBoxGenerateBBox.TabIndex = 0;
			this.checkBoxGenerateBBox.Text = "Generate Bounding-Boxes";
			this.checkBoxGenerateBBox.UseVisualStyleBackColor = true;
			// 
			// buttonConvert
			// 
			this.buttonConvert.Location = new System.Drawing.Point( 383, 24 );
			this.buttonConvert.Name = "buttonConvert";
			this.buttonConvert.Size = new System.Drawing.Size( 109, 23 );
			this.buttonConvert.TabIndex = 0;
			this.buttonConvert.Text = "Convert FBX Files";
			this.buttonConvert.UseVisualStyleBackColor = true;
			this.buttonConvert.Click += new System.EventHandler( this.buttonConvert_Click );
			// 
			// progressBar
			// 
			this.progressBar.Anchor = ((System.Windows.Forms.AnchorStyles) (((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Left)
						| System.Windows.Forms.AnchorStyles.Right)));
			this.progressBar.Location = new System.Drawing.Point( 12, 782 );
			this.progressBar.Name = "progressBar";
			this.progressBar.Size = new System.Drawing.Size( 1005, 8 );
			this.progressBar.Style = System.Windows.Forms.ProgressBarStyle.Continuous;
			this.progressBar.TabIndex = 6;
			// 
			// openFileDialog
			// 
			this.openFileDialog.DefaultExt = "*.fbx";
			this.openFileDialog.Filter = "FBX Files (*.fbx)|*.fbx|All Files (*.*)|*.*";
			this.openFileDialog.Multiselect = true;
			this.openFileDialog.Title = "Choose the FBX file to convert...";
			// 
			// openScriptFileDialog
			// 
			this.openScriptFileDialog.DefaultExt = "*.jscript";
			this.openScriptFileDialog.Filter = "JScript Files (*.jscript)|*.jscript|All Files (*.*)|*.*";
			this.openScriptFileDialog.Title = "Choose the JScript file to use for conversion...";
			// 
			// errorProvider
			// 
			this.errorProvider.ContainerControl = this;
			// 
			// folderBrowserDialog
			// 
			this.folderBrowserDialog.Description = "Choose the target directory for textures";
			// 
			// folderBrowserDialogOutputSceneFiles
			// 
			this.folderBrowserDialogOutputSceneFiles.Description = "Choose the target directory for scene files";
			// 
			// FBXConverterForm
			// 
			this.AutoScaleDimensions = new System.Drawing.SizeF( 6F, 13F );
			this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
			this.ClientSize = new System.Drawing.Size( 1029, 792 );
			this.Controls.Add( this.progressBar );
			this.Controls.Add( this.groupBoxMain );
			this.Controls.Add( this.textBoxInfos );
			this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedSingle;
			this.MaximizeBox = false;
			this.MinimizeBox = false;
			this.Name = "FBXConverterForm";
			this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
			this.Text = "FBX -> O3D Converter";
			this.groupBoxMain.ResumeLayout( false );
			this.groupBoxMain.PerformLayout();
			this.groupBoxOptions.ResumeLayout( false );
			this.groupBoxOptions.PerformLayout();
			this.groupBox4.ResumeLayout( false );
			this.groupBox4.PerformLayout();
			this.groupBox3.ResumeLayout( false );
			this.groupBox3.PerformLayout();
			this.groupBoxMaterials.ResumeLayout( false );
			this.groupBoxMaterials.PerformLayout();
			this.groupBoxTextureConversion.ResumeLayout( false );
			this.groupBoxTextureConversion.PerformLayout();
			this.groupBox1.ResumeLayout( false );
			this.groupBox1.PerformLayout();
			this.groupBox6.ResumeLayout( false );
			this.groupBox6.PerformLayout();
			this.groupBox5.ResumeLayout( false );
			this.groupBox5.PerformLayout();
			this.groupBoxConsolidate.ResumeLayout( false );
			this.groupBoxConsolidate.PerformLayout();
			this.groupBox2.ResumeLayout( false );
			this.groupBox2.PerformLayout();
			((System.ComponentModel.ISupportInitialize) (this.errorProvider)).EndInit();
			this.ResumeLayout( false );
			this.PerformLayout();

		}

		#endregion

		private System.Windows.Forms.TextBox textBoxInfos;
		private System.Windows.Forms.GroupBox groupBoxMain;
		private System.Windows.Forms.ProgressBar progressBar;
		private System.Windows.Forms.OpenFileDialog openFileDialog;
		private System.Windows.Forms.Button buttonConvert;
		private System.Windows.Forms.GroupBox groupBoxOptions;
		private System.Windows.Forms.CheckBox checkBoxGenerateBBox;
		private System.Windows.Forms.CheckBox checkBoxGenerateTriangleStrips;
		private System.Windows.Forms.GroupBox groupBox1;
		private System.Windows.Forms.CheckBox checkBoxStorePivot;
		private System.Windows.Forms.GroupBox groupBox2;
		private System.Windows.Forms.CheckBox checkBoxGenerateTangentSpace;
		private System.Windows.Forms.GroupBox groupBoxMaterials;
		private System.Windows.Forms.GroupBox groupBoxTextureConversion;
		private System.Windows.Forms.Label label1;
		private System.Windows.Forms.ComboBox comboBoxConvertDiffuse;
		private System.Windows.Forms.Label label2;
		private System.Windows.Forms.CheckBox checkBoxGenerateNormalMipMaps;
		private System.Windows.Forms.CheckBox checkBoxGenerateDiffuseMipMaps;
		private System.Windows.Forms.ComboBox comboBoxConvertNormal;
		private System.Windows.Forms.ComboBox comboBoxConvertRegular;
		private System.Windows.Forms.Label label3;
		private System.Windows.Forms.CheckBox checkBoxGenerateRegularMipMaps;
		private System.Windows.Forms.RadioButton radioButtonStoreTextureNames;
		private System.Windows.Forms.RadioButton radioButtonStoreTextures;
		private System.Windows.Forms.GroupBox groupBoxConsolidate;
		private System.Windows.Forms.CheckBox checkBoxConsolidateSplitBySG;
		private System.Windows.Forms.CheckBox checkBoxConsolidateSplitByUV;
		private System.Windows.Forms.CheckBox checkBoxConsolidate;
		private System.Windows.Forms.CheckBox checkBoxConsolidateSplitByColor;
		private System.Windows.Forms.CheckBox checkBoxStoreHDRVertexColors;
		private System.Windows.Forms.Label label4;
		private System.Windows.Forms.RadioButton radioButtonNoTSValidate;
		private System.Windows.Forms.RadioButton radioButtonNoTSSkip;
		private System.Windows.Forms.RadioButton radioButtonNoTSNotify;
		private System.Windows.Forms.GroupBox groupBox3;
		private System.Windows.Forms.TextBox textBoxScriptFile;
		private System.Windows.Forms.Button buttonRebuildScript;
		private System.Windows.Forms.Button buttonLoadScript;
		private System.Windows.Forms.OpenFileDialog openScriptFileDialog;
		private System.Windows.Forms.ErrorProvider errorProvider;
		private System.Windows.Forms.Label labelError;
		private System.Windows.Forms.Label label5;
		private IntegerTrackbarControl integerTrackbarControlJPGQuality;
		private System.Windows.Forms.CheckBox checkBoxShowWarnings;
		private System.Windows.Forms.CheckBox checkBoxPrettyPrint;
		private System.Windows.Forms.CheckBox checkBoxCompactUVs;
		private System.Windows.Forms.GroupBox groupBox4;
		private System.Windows.Forms.CheckBox checkBoxResetXForm;
		private IntegerTrackbarControl integerTrackbarControlMinUVs;
		private System.Windows.Forms.Label label6;
		private System.Windows.Forms.Label label7;
		private System.Windows.Forms.ComboBox comboBoxPreset;
		private System.Windows.Forms.Label label8;
		private System.Windows.Forms.Button buttonRemovePreset;
		private System.Windows.Forms.CheckBox checkBoxCompactMeshes;
		private System.Windows.Forms.TextBox textBoxTexturesBaseDirectory;
		private System.Windows.Forms.Button buttonBrowseTextureBaseDirectory;
		private System.Windows.Forms.CheckBox checkBoxCopyTexturesToBaseDirectory;
		private System.Windows.Forms.FolderBrowserDialog folderBrowserDialog;
		private System.Windows.Forms.GroupBox groupBox6;
		private System.Windows.Forms.GroupBox groupBox5;
		private System.Windows.Forms.CheckBox checkBoxExportAnimations;
		private System.Windows.Forms.TextBox textBoxOutputSceneFilesDirectory;
		private System.Windows.Forms.RadioButton radioButtonOutputFilesToDirectory;
		private System.Windows.Forms.Button buttonOutputSceneFiles;
		private System.Windows.Forms.RadioButton radioButtonGenerateTGZ;
		private System.Windows.Forms.FolderBrowserDialog folderBrowserDialogOutputSceneFiles;
	}
}

