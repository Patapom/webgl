namespace FBXConverter
{
	partial class MessageBoxSingleton
	{
		/// <summary>
		/// Required designer variable.
		/// </summary>
		private System.Windows.Forms.CheckBox checkBoxDontAsk;
		private System.Windows.Forms.Button buttonResult0;
		private System.Windows.Forms.Button buttonResult1;
		private System.Windows.Forms.Button buttonResult2;
		private System.Windows.Forms.TextBox textBox;
		private System.Windows.Forms.Panel panelIcon;

		private void InitializeComponent()
		{
			this.checkBoxDontAsk = new System.Windows.Forms.CheckBox();
			this.buttonResult0 = new System.Windows.Forms.Button();
			this.buttonResult1 = new System.Windows.Forms.Button();
			this.buttonResult2 = new System.Windows.Forms.Button();
			this.textBox = new System.Windows.Forms.TextBox();
			this.panelIcon = new System.Windows.Forms.Panel();
			this.SuspendLayout();
			// 
			// checkBoxDontAsk
			// 
			this.checkBoxDontAsk.Anchor = ((System.Windows.Forms.AnchorStyles) ((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Left)));
			this.checkBoxDontAsk.AutoSize = true;
			this.checkBoxDontAsk.Location = new System.Drawing.Point( 13, 272 );
			this.checkBoxDontAsk.Name = "checkBoxDontAsk";
			this.checkBoxDontAsk.Size = new System.Drawing.Size( 117, 17 );
			this.checkBoxDontAsk.TabIndex = 0;
			this.checkBoxDontAsk.Text = "Don\'t ask me again";
			this.checkBoxDontAsk.UseVisualStyleBackColor = true;
			// 
			// buttonResult0
			// 
			this.buttonResult0.Anchor = ((System.Windows.Forms.AnchorStyles) ((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Right)));
			this.buttonResult0.Location = new System.Drawing.Point( 425, 268 );
			this.buttonResult0.Name = "buttonResult0";
			this.buttonResult0.Size = new System.Drawing.Size( 75, 23 );
			this.buttonResult0.TabIndex = 1;
			this.buttonResult0.Text = "Result0";
			this.buttonResult0.UseVisualStyleBackColor = true;
			// 
			// buttonResult1
			// 
			this.buttonResult1.Anchor = ((System.Windows.Forms.AnchorStyles) ((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Right)));
			this.buttonResult1.Location = new System.Drawing.Point( 344, 268 );
			this.buttonResult1.Name = "buttonResult1";
			this.buttonResult1.Size = new System.Drawing.Size( 75, 23 );
			this.buttonResult1.TabIndex = 1;
			this.buttonResult1.Text = "Result1";
			this.buttonResult1.UseVisualStyleBackColor = true;
			// 
			// buttonResult2
			// 
			this.buttonResult2.Anchor = ((System.Windows.Forms.AnchorStyles) ((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Right)));
			this.buttonResult2.Location = new System.Drawing.Point( 263, 268 );
			this.buttonResult2.Name = "buttonResult2";
			this.buttonResult2.Size = new System.Drawing.Size( 75, 23 );
			this.buttonResult2.TabIndex = 1;
			this.buttonResult2.Text = "Result2";
			this.buttonResult2.UseVisualStyleBackColor = true;
			// 
			// textBox
			// 
			this.textBox.Anchor = ((System.Windows.Forms.AnchorStyles) ((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom)
						| System.Windows.Forms.AnchorStyles.Left)
						| System.Windows.Forms.AnchorStyles.Right)));
			this.textBox.BorderStyle = System.Windows.Forms.BorderStyle.None;
			this.textBox.HideSelection = false;
			this.textBox.Location = new System.Drawing.Point( 74, 12 );
			this.textBox.Multiline = true;
			this.textBox.Name = "textBox";
			this.textBox.ReadOnly = true;
			this.textBox.Size = new System.Drawing.Size( 426, 240 );
			this.textBox.TabIndex = 2;
			// 
			// panelIcon
			// 
			this.panelIcon.BackgroundImage = global::FBXConverter.Properties.Resources.Information;
			this.panelIcon.Location = new System.Drawing.Point( 13, 12 );
			this.panelIcon.Name = "panelIcon";
			this.panelIcon.Size = new System.Drawing.Size( 32, 32 );
			this.panelIcon.TabIndex = 3;
			// 
			// MessageBoxSingleton
			// 
			this.ClientSize = new System.Drawing.Size( 512, 301 );
			this.Controls.Add( this.panelIcon );
			this.Controls.Add( this.textBox );
			this.Controls.Add( this.buttonResult2 );
			this.Controls.Add( this.buttonResult1 );
			this.Controls.Add( this.buttonResult0 );
			this.Controls.Add( this.checkBoxDontAsk );
			this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedDialog;
			this.MaximizeBox = false;
			this.MinimizeBox = false;
			this.Name = "MessageBoxSingleton";
			this.StartPosition = System.Windows.Forms.FormStartPosition.CenterParent;
			this.ResumeLayout( false );
			this.PerformLayout();

		}
	}
}
