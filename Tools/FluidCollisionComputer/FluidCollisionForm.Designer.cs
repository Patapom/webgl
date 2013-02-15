namespace FluidCollisionComputer
{
	partial class FluidCollisionForm
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
			this.buttonOpen = new System.Windows.Forms.Button();
			this.buttonComputeDistanceMap = new System.Windows.Forms.Button();
			this.outputPanel = new FluidCollisionComputer.OutputPanel();
			this.buttonSaveResultImage = new System.Windows.Forms.Button();
			this.saveFileDialog = new System.Windows.Forms.SaveFileDialog();
			this.SuspendLayout();
			// 
			// openFileDialog
			// 
			this.openFileDialog.Filter = "All Image Files|*.bmp;*.png;*.jpg|All Files (*.*)|*.*";
			this.openFileDialog.Title = "Choose a bitmap file to use as collision map";
			// 
			// buttonOpen
			// 
			this.buttonOpen.Anchor = ((System.Windows.Forms.AnchorStyles) ((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Left)));
			this.buttonOpen.Location = new System.Drawing.Point( 12, 622 );
			this.buttonOpen.Name = "buttonOpen";
			this.buttonOpen.Size = new System.Drawing.Size( 116, 23 );
			this.buttonOpen.TabIndex = 1;
			this.buttonOpen.Text = "Open Collision File";
			this.buttonOpen.UseVisualStyleBackColor = true;
			this.buttonOpen.Click += new System.EventHandler( this.buttonOpen_Click );
			// 
			// buttonComputeDistanceMap
			// 
			this.buttonComputeDistanceMap.Anchor = ((System.Windows.Forms.AnchorStyles) ((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Left)));
			this.buttonComputeDistanceMap.Location = new System.Drawing.Point( 134, 622 );
			this.buttonComputeDistanceMap.Name = "buttonComputeDistanceMap";
			this.buttonComputeDistanceMap.Size = new System.Drawing.Size( 142, 23 );
			this.buttonComputeDistanceMap.TabIndex = 1;
			this.buttonComputeDistanceMap.Text = "Compute Distance Map";
			this.buttonComputeDistanceMap.UseVisualStyleBackColor = true;
			this.buttonComputeDistanceMap.Click += new System.EventHandler( this.buttonComputeDistanceMap_Click );
			// 
			// outputPanel
			// 
			this.outputPanel.Anchor = ((System.Windows.Forms.AnchorStyles) ((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom)
						| System.Windows.Forms.AnchorStyles.Left)
						| System.Windows.Forms.AnchorStyles.Right)));
			this.outputPanel.Location = new System.Drawing.Point( 12, 12 );
			this.outputPanel.Name = "outputPanel";
			this.outputPanel.Size = new System.Drawing.Size( 620, 604 );
			this.outputPanel.TabIndex = 2;
			// 
			// buttonSaveResultImage
			// 
			this.buttonSaveResultImage.Anchor = ((System.Windows.Forms.AnchorStyles) ((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Right)));
			this.buttonSaveResultImage.Enabled = false;
			this.buttonSaveResultImage.Location = new System.Drawing.Point( 516, 622 );
			this.buttonSaveResultImage.Name = "buttonSaveResultImage";
			this.buttonSaveResultImage.Size = new System.Drawing.Size( 116, 23 );
			this.buttonSaveResultImage.TabIndex = 1;
			this.buttonSaveResultImage.Text = "SaveResultImage";
			this.buttonSaveResultImage.UseVisualStyleBackColor = true;
			this.buttonSaveResultImage.Click += new System.EventHandler( this.buttonSaveResultImage_Click );
			// 
			// saveFileDialog
			// 
			this.saveFileDialog.DefaultExt = "*.png";
			this.saveFileDialog.Filter = "PNG Files (*.png)|*.png";
			// 
			// FluidCollisionForm
			// 
			this.AutoScaleDimensions = new System.Drawing.SizeF( 6F, 13F );
			this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
			this.ClientSize = new System.Drawing.Size( 644, 677 );
			this.Controls.Add( this.outputPanel );
			this.Controls.Add( this.buttonComputeDistanceMap );
			this.Controls.Add( this.buttonSaveResultImage );
			this.Controls.Add( this.buttonOpen );
			this.Name = "FluidCollisionForm";
			this.Text = "Fluid Collision";
			this.ResumeLayout( false );

		}

		#endregion

		private System.Windows.Forms.OpenFileDialog openFileDialog;
		private System.Windows.Forms.Button buttonOpen;
		private System.Windows.Forms.Button buttonComputeDistanceMap;
		private OutputPanel outputPanel;
		private System.Windows.Forms.Button buttonSaveResultImage;
		private System.Windows.Forms.SaveFileDialog saveFileDialog;
	}
}

