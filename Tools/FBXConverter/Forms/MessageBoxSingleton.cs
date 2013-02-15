using System;
using System.ComponentModel;
using System.Collections.Generic;
using System.Diagnostics;
using System.Text;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Drawing2D;
using System.Windows.Forms;

namespace FBXConverter
{
	public partial class MessageBoxSingleton : Form
	{
		#region PROPERTIES

		public string	Caption
		{
			get { return this.Text; }
			set { this.Text = value; }
		}

		public string	Message
		{
			get { return textBox.Text; }
			set
			{
				textBox.Text = value;

				// Measure the size of the text
				Graphics	G = this.CreateGraphics();
				SizeF		TextSize = G.MeasureString( value, textBox.Font );
				G.Dispose();

				// Compute the form's rectangle
				this.Size = new Size( 74 + Math.Max( 200, (int) TextSize.Width ) + 18, 12 + Math.Max( 50, (int) TextSize.Height ) + 74 );
			}
		}

		protected MessageBoxButtons	m_Buttons = MessageBoxButtons.OK;
		public MessageBoxButtons	Buttons
		{
			get { return m_Buttons; }
			set
			{
				m_Buttons = value;

				// Update visibility
				switch ( m_Buttons )
				{
					case MessageBoxButtons.OK:
						buttonResult1.Visible = false;
						buttonResult2.Visible = false;
						break;

					case MessageBoxButtons.OKCancel:
					case MessageBoxButtons.YesNo:
					case MessageBoxButtons.RetryCancel:
						buttonResult1.Visible = true;
						buttonResult2.Visible = false;
						break;

					case MessageBoxButtons.YesNoCancel:
					case MessageBoxButtons.AbortRetryIgnore:
						buttonResult1.Visible = true;
						buttonResult2.Visible = true;
						break;
				}

				// Update text & dialog results
				switch ( m_Buttons )
				{
					case MessageBoxButtons.AbortRetryIgnore:
						buttonResult2.Text = "Abort";
						buttonResult1.Text = "Retry";
						buttonResult0.Text = "Ignore";
						buttonResult2.DialogResult = DialogResult.Abort;
						buttonResult1.DialogResult = DialogResult.Retry;
						buttonResult0.DialogResult = DialogResult.Ignore;
						break;

					case MessageBoxButtons.OK:
						buttonResult0.Text = "OK";
						buttonResult0.DialogResult = DialogResult.OK;
						break;

					case MessageBoxButtons.OKCancel:
						buttonResult1.Text = "OK";
						buttonResult0.Text = "Cancel";
						buttonResult1.DialogResult = DialogResult.OK;
						buttonResult0.DialogResult = DialogResult.Cancel;
						break;

					case MessageBoxButtons.RetryCancel:
						buttonResult1.Text = "Retry";
						buttonResult0.Text = "Cancel";
						buttonResult1.DialogResult = DialogResult.Retry;
						buttonResult0.DialogResult = DialogResult.Cancel;
						break;

					case MessageBoxButtons.YesNo:
						buttonResult1.Text = "Yes";
						buttonResult0.Text = "No";
						buttonResult1.DialogResult = DialogResult.Yes;
						buttonResult0.DialogResult = DialogResult.No;
						break;

					case MessageBoxButtons.YesNoCancel:
						buttonResult2.Text = "Yes";
						buttonResult1.Text = "No";
						buttonResult0.Text = "Cancel";
						buttonResult2.DialogResult = DialogResult.Yes;
						buttonResult1.DialogResult = DialogResult.No;
						buttonResult0.DialogResult = DialogResult.Cancel;
						break;
				}

				// Update tab stops
				if ( buttonResult2.Visible )
					buttonResult2.TabIndex = 0;
				else if ( buttonResult1.Visible )
					buttonResult1.TabIndex = 0;
				else
					buttonResult0.TabIndex = 0;
			}
		}

		protected MessageBoxIcon	m_Icon = MessageBoxIcon.Information;
		public MessageBoxIcon	BoxIcon
		{
			get { return m_Icon; }
			set
			{
				m_Icon = value;

				panelIcon.Visible = true;
				switch ( m_Icon )
				{
					case MessageBoxIcon.None:
						panelIcon.Visible = false;
						break;

					case MessageBoxIcon.Information:
					case MessageBoxIcon.Question:
						panelIcon.BackgroundImage = Properties.Resources.Information;
						break;

					case MessageBoxIcon.Warning:
						panelIcon.BackgroundImage = Properties.Resources.Warning;
						break;

					case MessageBoxIcon.Error:
						panelIcon.BackgroundImage = Properties.Resources.Error;
						break;
				}
			}
		}

		public bool		ShowAgain
		{
			get { return !checkBoxDontAsk.Checked; }
			set { checkBoxDontAsk.Checked = !value; }
		}

		#endregion

		#region METHODS

		public	MessageBoxSingleton()
		{
			InitializeComponent();
		}

		public static DialogResult	Show( IWin32Window _Owner, string _Text, string _Caption, MessageBoxButtons _Buttons, MessageBoxIcon _Icon, out bool _bShowAgain )
		{
			MessageBoxSingleton	F = new MessageBoxSingleton();
								F.Caption = _Caption;
								F.Buttons = _Buttons;
								F.BoxIcon = _Icon;
								F.Message = _Text;

			DialogResult	Result = F.ShowDialog( _Owner );

			_bShowAgain = F.ShowAgain;

			return	Result;
		}

		#endregion
	}
}
