import { Container, Row, Col } from "react-bootstrap";
import { MailchimpForm } from "./MailchimpForm";
import newlogo6 from "../assets/img/newlogo6.png";
import navIcon1 from "../assets/img/nav-icon1.svg";
import github2 from '../assets/img/github2.png';
import navIcon3 from "../assets/img/nav-icon3.svg";

export const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <Row className="align-items-center">
          <MailchimpForm />
          <Col size={12} sm={6}>
            <img src={newlogo6} alt="Logo" />
          </Col>
          <Col size={12} sm={6} className="text-center text-sm-end">
            <div className="social-icon">
              <a href="#"><img src={navIcon1} alt="Icon" /></a>
              <a href="#"><img src={github2} alt="Icon" /></a>
              <a href="#"><img src={navIcon3} alt="Icon" /></a>
            </div>
             <p>© 2023 Raghav Matta. All Rights Reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}
