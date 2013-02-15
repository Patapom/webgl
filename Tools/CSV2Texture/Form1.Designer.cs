namespace CSV2Texture
{
	partial class Form1
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
			this.openFileDialog = new System.Windows.Forms.OpenFileDialog();
			this.saveFileDialog = new System.Windows.Forms.SaveFileDialog();
			this.SuspendLayout();
			// 
			// openFileDialog
			// 
			this.openFileDialog.DefaultExt = "*.csv";
			this.openFileDialog.Filter = "CSV Files|*.csv";
			// 
			// saveFileDialog
			// 
			this.saveFileDialog.DefaultExt = "*.png";
			this.saveFileDialog.Filter = "PNG Files|*.png";
			// 
			// Form1
			// 
			this.AutoScaleDimensions = new System.Drawing.SizeF( 6F, 13F );
			this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
			this.ClientSize = new System.Drawing.Size( 440, 323 );
			this.Name = "Form1";
			this.Text = "Form1";
			this.ResumeLayout( false );

		}

		#endregion

		private System.Windows.Forms.OpenFileDialog openFileDialog;
		private System.Windows.Forms.SaveFileDialog saveFileDialog;
	}
}

